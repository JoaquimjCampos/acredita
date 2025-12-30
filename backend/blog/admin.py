from django.contrib import admin
from .models import BlogPost, BlogCategory, BlogPostCategory


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'status', 'created_at', 'views_count', 'likes_count')
    list_filter = ('status', 'created_at', 'published_at')
    search_fields = ('title', 'content', 'meta_description')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('created_at', 'updated_at', 'views_count', 'likes_count')
    fieldsets = (
        ('Content', {
            'fields': ('title', 'slug', 'author', 'content', 'excerpt', 'featured_image')
        }),
        ('Publishing', {
            'fields': ('status', 'published_at')
        }),
        ('SEO', {
            'fields': ('meta_description', 'meta_keywords'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('views_count', 'likes_count'),
            'classes': ('collapse',)
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    date_hierarchy = 'created_at'


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(BlogPostCategory)
class BlogPostCategoryAdmin(admin.ModelAdmin):
    list_display = ('post', 'category')
    search_fields = ('post__title', 'category__name')
    list_filter = ('category',)
