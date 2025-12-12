# --- Django settings initialization (must be first) ---
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "acredita_backend.settings")
import django
django.setup()

from django.apps import apps

from fastapi import FastAPI, Request, Depends, HTTPException, status, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.wsgi import WSGIMiddleware
from fastapi.middleware.cors import CORSMiddleware

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from starlette.concurrency import run_in_threadpool
from jose import JWTError, jwt
from datetime import datetime, timedelta
import logging
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import update_last_login
from typing import Any

from django.core.wsgi import get_wsgi_application


# --- Logging Middleware ---
import sys
logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logger = logging.getLogger("acredita-fastapi")

class LoggingMiddleware:
    def __init__(self, app):
        self.app = app
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            logger.info(f"Request: {scope['method']} {scope['path']}")
        await self.app(scope, receive, send)



from fastapi import status
from pydantic import BaseModel
from typing import List, Optional, Any
from django.db import transaction

# --- OpenAPI tags for better docs organization ---
tags_metadata = [
    {"name": "Auth", "description": "Authentication and user management endpoints."},
    {"name": "Participants", "description": "Endpoints for participants and dashboard."},
    {"name": "Products", "description": "Endpoints for products and orders."},
    {"name": "Games", "description": "Endpoints for games and ads."},
    {"name": "Content", "description": "Endpoints for content pages."},
]
app = FastAPI(title="Acredita FastAPI Service", root_path="/api", openapi_tags=tags_metadata)
app.add_middleware(LoggingMiddleware)

# CORS middleware (allow all origins for demo, restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount Django WSGI app at /django/
SECRET_KEY = os.environ.get("ACREDITA_SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token/")
User = get_user_model()
django_app = get_wsgi_application()
app.mount("/django", WSGIMiddleware(django_app))



    # --- JWT Auth Setup (integrated with Django user model) ---
    # --- JWT Auth Setup (integrated with Django user model) ---

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        user = await run_in_threadpool(lambda: User.objects.filter(id=user_id).first())
        if not user:
            raise credentials_exception
        return user
    except JWTError:
        raise credentials_exception


# --- Response models for OpenAPI ---
class SeasonOut(BaseModel):
    id: int
    title: Optional[str]
    year: Optional[int]
    is_active: Optional[bool]
    start_date: Optional[str]
    end_date: Optional[str]

class SeasonsResponse(BaseModel):
    results: List[SeasonOut]
    count: int

class ErrorResponse(BaseModel):
    error: str

# --- Seasons endpoint for frontend ---

@app.get("/seasons/", response_model=SeasonsResponse, tags=["Participants"], responses={
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "Unauthorized"},
    status.HTTP_200_OK: {"description": "List of seasons."}
})
async def get_seasons(current_user: Any = Depends(get_current_user)):
    Season = apps.get_model('seasons', 'Season')
    seasons = await run_in_threadpool(lambda: list(Season.objects.all()))
    data = [
        SeasonOut(
            id=s.id,
            title=getattr(s, "title", None),
            year=getattr(s, "year", None),
            is_active=getattr(s, "is_active", None),
            start_date=str(getattr(s, "start_date", None)) if getattr(s, "start_date", None) else None,
            end_date=str(getattr(s, "end_date", None)) if getattr(s, "end_date", None) else None,
        )
        for s in seasons
    ]
    return {"results": data, "count": len(data)}

from fastapi import Form

# --- Feedback endpoint for PLG ---
class FeedbackRequest(BaseModel):
    name: str
    email: str
    comments: str

class FeedbackResponse(BaseModel):
    message: str

@app.post("/feedback/", response_model=FeedbackResponse, tags=["Games"], responses={
    status.HTTP_201_CREATED: {"description": "Feedback submitted."},
    status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse, "description": "Invalid feedback."}
})
async def submit_feedback(payload: FeedbackRequest):
    # In production, save to DB or send email. Here, just log and return success.
    logger.info(f"Feedback received: {payload}")
    return FeedbackResponse(message="Thank you for your feedback!")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token/")
User = get_user_model()

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        user = await run_in_threadpool(lambda: User.objects.filter(id=user_id).first())
        if not user:
            raise credentials_exception
        return user
    except JWTError:
        raise credentials_exception




class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""

class RegisterResponse(BaseModel):
    id: int
    username: str
    email: str

@app.post("/register/", response_model=RegisterResponse, tags=["Auth"], responses={
    status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse, "description": "Username or email already exists."},
    status.HTTP_201_CREATED: {"description": "User registered."}
})
async def register(payload: RegisterRequest):
    User = get_user_model()
    if await run_in_threadpool(lambda: User.objects.filter(username=payload.username).exists()):
        raise HTTPException(status_code=400, detail="Username already exists")
    if await run_in_threadpool(lambda: User.objects.filter(email=payload.email).exists()):
        raise HTTPException(status_code=400, detail="Email already exists")
    def create_user():
        user = User.objects.create_user(
            username=payload.username,
            email=payload.email,
            password=payload.password,
            first_name=payload.first_name,
            last_name=payload.last_name
        )
        return user
    user = await run_in_threadpool(create_user)
    return RegisterResponse(id=user.id, username=user.username, email=user.email)

# --- Password reset (stub, for integration with Django's system) ---
@app.post("/password-reset/")
async def password_reset(email: str = Body(...)):
    # In production, use Django's password reset system (send email, etc.)
    user = await run_in_threadpool(lambda: User.objects.filter(email=email).first())
    if not user:
        raise HTTPException(status_code=404, detail="User with this email does not exist")
    # Here you would trigger Django's password reset email logic
    return {"message": "If this email exists, a password reset link will be sent."}

# --- Token endpoint for login (real Django user check) ---
@app.post("/token/")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    User = get_user_model()
    # Try username first
    user = await run_in_threadpool(authenticate, username=form_data.username, password=form_data.password)
    if not user:
        # Try email as username
        try:
            user_obj = await run_in_threadpool(User.objects.get, email=form_data.username)
            user = await run_in_threadpool(authenticate, username=user_obj.username, password=form_data.password)
        except User.DoesNotExist:
            user = None
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username/email or password")
    await run_in_threadpool(update_last_login, None, user)
    access_token = create_access_token(data={"user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Dashboard endpoint ---
@app.get("/participants/dashboard/")
async def dashboard(current_user: Any = Depends(get_current_user)):
    # Example: return stats for the user (customize as needed)
    return {
        'totalParticipants': 42,  # Replace with real logic
        'totalVotes': 123,
        'currentSeason': '2025',
        'userVotes': 7,
        'favoriteParticipant': None,
        'nextEpisode': None,
    }



# --- Activity endpoint ---
@app.get("/participants/activity/")
async def activity(current_user: Any = Depends(get_current_user)):
    # Example: return recent activity (customize as needed)
    return []  # Replace with real logic

# --- Participant detail endpoint ---
@app.get("/participants/{participant_id}/")
async def get_participant(participant_id: int, current_user: Any = Depends(get_current_user)):
    p = await run_in_threadpool(lambda: Participant.objects.select_related('user').filter(id=participant_id).first())
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
    return {
        "id": p.id,
        "business_name": p.business_name,
        "participant_number": p.participant_number,
        "status": p.status,
        "public_votes": p.public_votes,
        "user": {
            "id": p.user.id,
            "email": p.user.email,
            "full_name": getattr(p.user, 'full_name', str(p.user)),
        },
        "created_at": p.created_at,
        "funding_goal": float(p.funding_goal) if p.funding_goal else None,
        "funding_received": float(p.funding_received) if p.funding_received else 0,
        "funding_percentage": p.funding_percentage,
    }

# --- Product detail endpoint ---
@app.get("/products/{product_id}/")
async def get_product(product_id: int, current_user: Any = Depends(get_current_user)):
    p = await run_in_threadpool(lambda: Product.objects.filter(id=product_id).first())
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return {
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "price": float(p.price),
    }

# --- Order detail endpoint ---
@app.get("/orders/{order_id}/")
async def get_order(order_id: int, current_user: Any = Depends(get_current_user)):
    o = await run_in_threadpool(lambda: Order.objects.select_related('product').filter(id=order_id).first())
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    return {
        "id": o.id,
        "product": {
            "id": o.product.id,
            "name": o.product.name,
        },
        "quantity": o.quantity,
        "created_at": o.created_at,
    }

# --- Profile update endpoint ---
@app.patch("/profile/")
async def update_profile(
    first_name: str = Body(None),
    last_name: str = Body(None),
    email: str = Body(None),
    current_user: Any = Depends(get_current_user)
):
    updated = False
    if first_name is not None:
        current_user.first_name = first_name
        updated = True
    if last_name is not None:
        current_user.last_name = last_name
        updated = True
    if email is not None and email != current_user.email:
        email_exists = await run_in_threadpool(lambda: User.objects.filter(email=email).exclude(id=current_user.id).exists())
        if email_exists:
            raise HTTPException(status_code=400, detail="Email already exists")
        current_user.email = email
        updated = True
    if updated:
        await run_in_threadpool(current_user.save)
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "is_staff": current_user.is_staff,
        "is_superuser": current_user.is_superuser,
    }

@app.get("/")
async def root():
    return {"message": "Acredita FastAPI is running!", "docs": "/docs", "django": "/django/"}

@app.get("/health/")
async def health():
    Season = apps.get_model('seasons', 'Season')
    return {"status": "ok"}



# Example of a protected endpoint using JWT and Django user
@app.get("/secure-data/")
async def secure_data(current_user: Any = Depends(get_current_user)):
    """Protected endpoint example. Returns a message for the authenticated user."""
    return {"data": f"This is protected data for {current_user.username}!"}

# Get current user profile (for frontend auth sync)
@app.get("/me/")
async def get_me(current_user: Any = Depends(get_current_user)):
    """Returns the current authenticated user's profile for the frontend."""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "first_name": getattr(current_user, 'first_name', ''),
        "last_name": getattr(current_user, 'last_name', ''),
        "is_staff": getattr(current_user, 'is_staff', False),
        "is_superuser": getattr(current_user, 'is_superuser', False),
    }

@app.post('/mcp/echo/')
async def mcp_echo(request: Request):
    mcp_context = request.headers.get('x-mcp-context')
    data = await request.json()
    return JSONResponse({
        "received_context": mcp_context,
        "received_data": data,
        "message": "FastAPI MCP endpoint funcionando!"
    })


# --- Django model integration and endpoints using Django ORM ---
# Placed at the very end of the file, after all FastAPI and Django setup
from django.apps import apps
from django.forms.models import model_to_dict
Participant = apps.get_model('participants', 'Participant')
Product = apps.get_model('store', 'Product')
Order = apps.get_model('store', 'Order')

# Example: protect these endpoints with JWT


# --- Participants response model and endpoint ---
class ParticipantUserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str]

class ParticipantOut(BaseModel):
    id: int
    business_name: Optional[str]
    participant_number: Optional[int]
    status: Optional[str]
    public_votes: Optional[int]
    user: ParticipantUserOut
    created_at: Optional[str]
    funding_goal: Optional[float]
    funding_received: Optional[float]
    funding_percentage: Optional[float]

class ParticipantsResponse(BaseModel):
    results: List[ParticipantOut]
    count: int

@app.get("/participants/", response_model=ParticipantsResponse, tags=["Participants"], responses={
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "Unauthorized"},
    status.HTTP_200_OK: {"description": "List of participants."}
})
async def list_participants(current_user: Any = Depends(get_current_user)):
    """
    Returns a list of participants for the frontend. Each participant includes id, business_name, participant_number, status, public_votes, user, created_at, funding_goal, funding_received, and funding_percentage.
    Frontend should use this endpoint to dynamically render participant lists.
    """
    Participant = apps.get_model('participants', 'Participant')
    qs = await run_in_threadpool(lambda: list(Participant.objects.select_related('user').all()[:50]))
    data = [
        ParticipantOut(
            id=p.id,
            business_name=getattr(p, "business_name", None),
            participant_number=getattr(p, "participant_number", None),
            status=getattr(p, "status", None),
            public_votes=getattr(p, "public_votes", None),
            user=ParticipantUserOut(
                id=p.user.id,
                email=p.user.email,
                full_name=getattr(p.user, 'full_name', str(p.user)),
            ),
            created_at=str(getattr(p, "created_at", None)) if getattr(p, "created_at", None) else None,
            funding_goal=float(p.funding_goal) if p.funding_goal else None,
            funding_received=float(p.funding_received) if p.funding_received else 0,
            funding_percentage=getattr(p, "funding_percentage", None),
        )
        for p in qs
    ]
    return ParticipantsResponse(results=data, count=len(data))



# --- Products response model and endpoint ---
class ProductOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float

class ProductsResponse(BaseModel):
    results: List[ProductOut]
    count: int

@app.get("/products/", response_model=ProductsResponse, tags=["Products"], responses={
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "Unauthorized"},
    status.HTTP_200_OK: {"description": "List of products."}
})
async def list_products(current_user: Any = Depends(get_current_user)):
    """
    Returns a list of products for the frontend. Each product includes id, name, description, and price.
    Frontend should use this endpoint to dynamically render product lists.
    """
    Product = apps.get_model('store', 'Product')
    qs = await run_in_threadpool(lambda: list(Product.objects.all()[:50]))
    data = [
        ProductOut(
            id=p.id,
            name=p.name,
            description=getattr(p, "description", None),
            price=float(p.price),
        )
        for p in qs
    ]
    return ProductsResponse(results=data, count=len(data))



# --- Orders response model and endpoint ---
class OrderProductOut(BaseModel):
    id: int
    name: str

class OrderOut(BaseModel):
    id: int
    product: OrderProductOut
    quantity: int
    created_at: Optional[str]

class OrdersResponse(BaseModel):
    results: List[OrderOut]
    count: int

@app.get("/orders/", response_model=OrdersResponse, tags=["Products"], responses={
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "Unauthorized"},
    status.HTTP_200_OK: {"description": "List of orders."}
})
async def list_orders(current_user: Any = Depends(get_current_user)):
    """
    Returns a list of orders for the frontend. Each order includes id, product, quantity, and created_at.
    Frontend should use this endpoint to dynamically render order lists.
    """
    Order = apps.get_model('store', 'Order')
    qs = await run_in_threadpool(lambda: list(Order.objects.select_related('product').all()[:50]))
    data = [
        OrderOut(
            id=o.id,
            product=OrderProductOut(
                id=o.product.id,
                name=o.product.name,
            ),
            quantity=o.quantity,
            created_at=str(getattr(o, "created_at", None)) if getattr(o, "created_at", None) else None,
        )
        for o in qs
    ]
    return OrdersResponse(results=data, count=len(data))

# --- Ads endpoint for active ads (for Games page) ---
 
# --- Games endpoint for Games page ---

# --- Endpoint para perfil do utilizador autenticado (/accounts/profile/) ---
@app.get("/accounts/profile/")
async def get_account_profile(current_user: Any = Depends(get_current_user)):
    """Devolve os dados do utilizador autenticado para compatibilidade com o frontend."""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "first_name": getattr(current_user, 'first_name', ''),
        "last_name": getattr(current_user, 'last_name', ''),
        "is_staff": getattr(current_user, 'is_staff', False),
        "is_superuser": getattr(current_user, 'is_superuser', False),
    }

# --- Games response model and endpoint ---

# --- Enhanced Game response model ---
class GameOut(BaseModel):
    id: int
    type: str
    title: str
    description: str
    difficulty: Optional[str]
    category: Optional[str]
    asset_url: Optional[str]
    is_active: bool


class GamesResponse(BaseModel):
    results: List[GameOut]
    count: int


@app.get("/games/", response_model=GamesResponse, tags=["Games"], responses={
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "Unauthorized"},
    status.HTTP_200_OK: {"description": "List of available games with metadata."}
})
async def get_games(current_user: Any = Depends(get_current_user)):
    """
    Returns a dynamic list of available games from the database, including richer metadata for frontend rendering.
    """
    Game = apps.get_model('games', 'Game')
    games_qs = await run_in_threadpool(lambda: list(Game.objects.all()))
    games = [
        GameOut(
            id=g.id,
            type=g.type,
            title=g.title,
            description=g.description,
            difficulty=getattr(g, "difficulty", None),
            category=getattr(g, "category", None),
            asset_url=getattr(g, "asset_url", None),
            is_active=g.is_active,
        )
        for g in games_qs
    ]
    return GamesResponse(results=games, count=len(games))

# --- Ads response model and endpoint ---
class AdOut(BaseModel):
    id: int
    title: str
    image_url: Optional[str]
    link: Optional[str]
    page: Optional[str]

class AdsResponse(BaseModel):
    results: List[AdOut]
    count: int

@app.get("/ads/ads/active/", response_model=AdsResponse, tags=["Games"], responses={
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "Unauthorized"},
    status.HTTP_200_OK: {"description": "List of active ads."}
})
async def get_active_ads(current_user: Any = Depends(get_current_user)):
    """
    Returns a list of active ads for the Games page. Each ad includes id, title, image_url, link, and page.
    Frontend should use this endpoint to dynamically render ads.
    """
    Ad = apps.get_model('ads', 'Ad')
    ads = await run_in_threadpool(lambda: list(Ad.objects.filter(active=True)))
    data = [
        AdOut(
            id=ad.id,
            title=ad.title,
            image_url=getattr(ad, "image_url", None),
            link=getattr(ad, "link", None),
            page=getattr(ad, "page", None),
        )
        for ad in ads
    ]
    return AdsResponse(results=data, count=len(data))


# --- Content response model and endpoint ---
class ContentOut(BaseModel):
    id: int
    title: Optional[str]
    description: Optional[str]
    created_at: Optional[str]
    updated_at: Optional[str]

class ContentResponse(BaseModel):
    results: List[ContentOut]
    count: int

@app.get("/content/", response_model=ContentResponse, tags=["Content"], responses={
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "Unauthorized"},
    status.HTTP_404_NOT_FOUND: {"model": ErrorResponse, "description": "Content model not found."},
    status.HTTP_200_OK: {"description": "List of content items."}
})
async def get_content(current_user: Any = Depends(get_current_user)):
    """
    Returns a list of content items for the frontend. Each item includes id, title, description, created_at, and updated_at.
    Frontend should use this endpoint to dynamically render content pages.
    """
    try:
        Content = apps.get_model('content', 'Content')
    except LookupError:
        return JSONResponse(status_code=404, content={"error": "Content model not found."})
    contents = await run_in_threadpool(lambda: list(Content.objects.all()[:50]))
    data = [
        ContentOut(
            id=c.id,
            title=getattr(c, "title", None),
            description=getattr(c, "description", None),
            created_at=str(getattr(c, "created_at", None)) if getattr(c, "created_at", None) else None,
            updated_at=str(getattr(c, "updated_at", None)) if getattr(c, "updated_at", None) else None,
        )
        for c in contents
    ]
    return ContentResponse(results=data, count=len(data))


# --- Simulador and Game linking, endpoints, and demo creation ---
class SimulatorOut(BaseModel):
    id: int
    game_id: int
    name: str
    description: Optional[str]
    config: Optional[Any]
    is_active: bool

class RunSimulatorRequest(BaseModel):
    simulator_id: int
    input_data: Optional[Any]

class RunSimulatorResponse(BaseModel):
    simulator_id: int
    result: Any

class SimuladorOut(BaseModel):
    id: int
    title: str
    description: str
    type: str
    is_active: bool
    simulator_id: Optional[int]

class SimuladoresResponse(BaseModel):
    results: List[SimuladorOut]
    count: int

@app.get("/simuladores/", response_model=SimuladoresResponse, tags=["Games"], responses={
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "Unauthorized"},
    status.HTTP_200_OK: {"description": "List of simuladores."}
})
async def get_simuladores(current_user: Any = Depends(get_current_user)):
    Game = apps.get_model('games', 'Game')
    Simulator = apps.get_model('games', 'Simulator')
    simuladores_qs = await run_in_threadpool(lambda: list(Game.objects.filter(type='simulador')))
    # Link simulador to simulator if exists
    def get_simulator_id(game_id):
        sim = Simulator.objects.filter(game_id=game_id).first()
        return sim.id if sim else None
    simuladores = [
        SimuladorOut(
            id=s.id,
            title=s.title,
            description=s.description,
            type=s.type,
            is_active=getattr(s, 'is_active', True),
            simulator_id=get_simulator_id(s.id),
        )
        for s in simuladores_qs
    ]
    return SimuladoresResponse(results=simuladores, count=len(simuladores))

# List all simulators
@app.get("/simulators/", response_model=List[SimulatorOut], tags=["Games"])
async def list_simulators(current_user: Any = Depends(get_current_user)):
    Simulator = apps.get_model('games', 'Simulator')
    sims = await run_in_threadpool(lambda: list(Simulator.objects.all()))
    return [
        SimulatorOut(
            id=s.id,
            game_id=s.game_id,
            name=s.name,
            description=getattr(s, 'description', None),
            config=getattr(s, 'config', None),
            is_active=getattr(s, 'is_active', True),
        ) for s in sims
    ]

# Run/interact with a simulator
@app.post("/simulators/run/", response_model=RunSimulatorResponse, tags=["Games"])
async def run_simulator(payload: RunSimulatorRequest, current_user: Any = Depends(get_current_user)):
    Simulator = apps.get_model('games', 'Simulator')
    sim = await run_in_threadpool(lambda: Simulator.objects.filter(id=payload.simulator_id).first())
    if not sim:
        raise HTTPException(status_code=404, detail="Simulator not found")
    # Demo: just echo input_data, in real use run simulation logic
    result = {"echo": payload.input_data, "simulator": sim.name}
    return RunSimulatorResponse(simulator_id=sim.id, result=result)

# --- Demo simuladores creation endpoint ---
@app.post("/simuladores/demo-create/", tags=["Games"])
async def create_demo_simuladores(current_user: Any = Depends(get_current_user)):
    Game = apps.get_model('games', 'Game')
    Simulator = apps.get_model('games', 'Simulator')
    created = []
    with transaction.atomic():
        # Create demo games if not exist
        demo_games = [
            {"title": "Simulador Financeiro", "description": "Simula finanças pessoais.", "type": "simulador", "is_active": True},
            {"title": "Simulador de Mercado", "description": "Simula mercado de ações.", "type": "simulador", "is_active": True},
        ]
        for demo in demo_games:
            game, _ = Game.objects.get_or_create(title=demo["title"], defaults=demo)
            # Create linked simulator if not exist
            sim, _ = Simulator.objects.get_or_create(game_id=game.id, defaults={"name": game.title, "description": game.description, "is_active": True})
            created.append({"game_id": game.id, "simulator_id": sim.id, "title": game.title})
    return {"created": created, "count": len(created)}


