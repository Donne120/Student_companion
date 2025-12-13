"""
ALU Knowledge Base Module
Contains structured data about ALU for the chatbot
"""

from .search import search_knowledge_base, get_all_articles
from .admissions import ADMISSIONS_ARTICLES
from .wellness import WELLNESS_ARTICLES
from .academics import ACADEMICS_ARTICLES
from .campus import CAMPUS_ARTICLES
from .policies import POLICIES_ARTICLES

__all__ = [
    "search_knowledge_base",
    "get_all_articles",
    "ADMISSIONS_ARTICLES",
    "WELLNESS_ARTICLES", 
    "ACADEMICS_ARTICLES",
    "CAMPUS_ARTICLES",
    "POLICIES_ARTICLES",
]

