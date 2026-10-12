from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("name",)
        verbose_name_plural = "categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name) or "category"
            base, n = self.slug, 2
            while Category.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug, n = f"{base}-{n}", n + 1
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name
