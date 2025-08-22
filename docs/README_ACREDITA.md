# Backend-Frontend Integration Map (Acredita)

## Table: Backend Apps & Frontend Usage

| Backend App    | API Endpoint Prefix      | Frontend Hooks/Components                | Pages/Sections Using It                | Status      |
|---------------|-------------------------|------------------------------------------|----------------------------------------|-------------|
| accounts      | /api/accounts/          | useAuth, apiService (login/register)     | AuthContext, Login/Register, Profile   | Active      |
| participants  | /api/participants/      | useLeaderboard, useParticipants, apiService | HomePage, ParticipantsPage, DashboardPage, VotingPage | Active |
| seasons       | /api/seasons/           | useSeasons                               | HomePage, SeasonsPage                  | Active      |
| voting        | /api/voting/            | apiService.vote, Voting logic            | VotingPage                             | Active      |
| donations     | /api/donations/         | useDonationCampaigns                     | FundraisingSection                     | Active      |
| store         | /api/store/             | (Planned: useStore, apiService.store)    | (Planned: StorePage)                   | Inactive    |
| games         | /api/games/             | useGames                                 | GamesSection, GamesPage                | Active      |
| ads           | /api/ads/               | useAds                                   | AdsSection, GamesPage                  | Active      |
| content       | /api/content/           | (Planned: useContent)                    | (Planned: ContentPage)                 | Inactive    |
| blog          | /api/blog/              | (Planned: useBlog)                       | (Planned: BlogPage)                    | Inactive    |
| videos        | /api/videos/            | useVideos, VideoUploadSection            | VideosSection, MediaUploadSection      | Active      |

- **Active**: Used in production UI, data flows are implemented and visible.
- **Inactive/Planned**: API exists, but no or limited frontend integration yet.

## General Summary

This project integrates a Django REST backend with a React frontend. Each backend app exposes API endpoints, which are consumed in the frontend via custom React hooks and service classes. The main data flows (accounts, participants, seasons, voting, donations, games, ads, videos) are fully implemented and accessible in the UI. Store, content, and blog modules are planned for future integration.

### How to Verify Integration
- Check the relevant React hook (e.g., `useSeasons`, `useGames`) for API calls to `/api/{app}/` endpoints.
- Confirm UI components (e.g., `GamesSection`, `FundraisingSection`) render data from these hooks.
- For new backend features, create or update a hook and connect it to a UI component/page.


### Example: Global Voting Endpoint

#### Backend
**Endpoint:** `POST /api/global-vote/`
**Payload:**
```json
{
	"episode_id": 123,
	"participant_id": 456
}
```
**Response:**
```json
{
	"detail": "Voto registrado com sucesso."
}
```

#### Frontend
**Hook Example:**
```js
// useGlobalVote.js
import axios from 'axios';
export function useGlobalVote() {
	return async (episodeId, participantId) => {
		return axios.post('/api/global-vote/', {
			episode_id: episodeId,
			participant_id: participantId
		});
	};
}
```
**Usage in Component:**
```js
const vote = useGlobalVote();
vote(episodeId, participantId)
	.then(res => alert(res.data.detail))
	.catch(err => alert(err.response.data.detail));
```

---
### Release Checklist

- [ ] Validar endpoints REST e integração frontend (hooks, componentes)
- [ ] Atualizar documentação dos endpoints e exemplos de uso
- [ ] Executar testes automatizados (unitários, integração, E2E)
- [ ] Sincronizar releases backend/frontend para evitar breaking changes
- [ ] Coletar feedback dos usuários e ajustar funcionalidades
- [ ] Garantir acessibilidade e responsividade das páginas
- [ ] Revisar logs, métricas e monitoramento
- [ ] Atualizar roadmap e README

---
_Last updated: August 12, 2025_
