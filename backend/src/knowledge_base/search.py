"""
Knowledge Base Search
Provides local search functionality over ALU knowledge base
"""

import re
from typing import List, Dict, Any, Optional

from .admissions import ADMISSIONS_ARTICLES
from .wellness import WELLNESS_ARTICLES
from .academics import ACADEMICS_ARTICLES
from .campus import CAMPUS_ARTICLES
from .policies import POLICIES_ARTICLES


def get_all_articles() -> List[Dict[str, Any]]:
    """Get all knowledge base articles"""
    all_articles = []
    all_articles.extend(ADMISSIONS_ARTICLES)
    all_articles.extend(WELLNESS_ARTICLES)
    all_articles.extend(ACADEMICS_ARTICLES)
    all_articles.extend(CAMPUS_ARTICLES)
    all_articles.extend(POLICIES_ARTICLES)
    return all_articles


def search_knowledge_base(
    query: str,
    category: Optional[str] = None,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Search the knowledge base for relevant articles
    
    Args:
        query: Search query
        category: Optional category filter
        limit: Maximum number of results
    
    Returns:
        List of matching articles with relevance scores
    """
    query_lower = query.lower()
    query_words = set(re.findall(r'\w+', query_lower))
    
    # Get articles to search
    articles = get_all_articles()
    
    # Filter by category if specified
    if category:
        articles = [a for a in articles if a.get('category', '').lower() == category.lower()]
    
    results = []
    
    for article in articles:
        score = calculate_relevance(query_lower, query_words, article)
        
        if score > 0:
            results.append({
                **article,
                'relevance_score': score
            })
    
    # Sort by relevance
    results.sort(key=lambda x: x['relevance_score'], reverse=True)
    
    return results[:limit]


def calculate_relevance(query_lower: str, query_words: set, article: Dict) -> float:
    """Calculate relevance score for an article"""
    score = 0.0
    
    title = article.get('title', '').lower()
    content = article.get('content', '').lower()
    keywords = [k.lower() for k in article.get('keywords', [])]
    category = article.get('category', '').lower()
    
    # Exact phrase match in title (highest weight)
    if query_lower in title:
        score += 100
    
    # Exact phrase match in content
    if query_lower in content:
        score += 50
    
    # Keyword matches
    for keyword in keywords:
        if keyword in query_lower or query_lower in keyword:
            score += 30
        for word in query_words:
            if word in keyword or keyword in word:
                score += 15
    
    # Word matches in title
    title_words = set(re.findall(r'\w+', title))
    title_matches = len(query_words & title_words)
    score += title_matches * 20
    
    # Word matches in content
    content_words = set(re.findall(r'\w+', content))
    content_matches = len(query_words & content_words)
    score += content_matches * 5
    
    # Category match
    if any(word in category for word in query_words):
        score += 10
    
    # Boost for specific question patterns
    if 'how' in query_lower and ('how to' in content or 'steps' in content):
        score += 15
    if 'what' in query_lower and ('what is' in content or 'definition' in content):
        score += 15
    if 'where' in query_lower and ('location' in content or 'address' in content):
        score += 15
    if 'when' in query_lower and ('date' in content or 'time' in content or 'deadline' in content):
        score += 15
    if 'who' in query_lower and ('contact' in content or 'person' in content or 'staff' in content):
        score += 15
    
    return score

