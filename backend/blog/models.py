from django.db import models
from django.conf import settings


class BlogPost(models.Model):
    """Blog posts created by Mentors"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True, null=True)  # Allow null for migration
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blog_posts',
        null=True,  # Allow null for migration
        blank=True
    )
    content = models.TextField()
    excerpt = models.TextField(max_length=500, blank=True)
    featured_image = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # SEO
    meta_description = models.CharField(max_length=160, blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    # Engagement
    views_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status', '-published_at']),
            models.Index(fields=['author', '-created_at']),
        ]
    
    def __str__(self):
        return self.title


class BlogCategory(models.Model):
    """Blog post categories"""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = 'Blog Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class BlogPostCategory(models.Model):
    """Many-to-many relationship between posts and categories"""
    
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE)
    category = models.ForeignKey(BlogCategory, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ['post', 'category']
