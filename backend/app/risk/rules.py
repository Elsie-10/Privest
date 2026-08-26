"""
Deterministic recommendation engine. Consumes computed metrics only and
never uses an LLM to invent or estimate figures — ported 1:1 from
lib/ruleEngine.ts. This is the enforcement point for the project's core
rule: "the LLM must NOT calculate or invent financial metrics."
"""

from __future__ import annotations

from app.schemas.portfolio import PortfolioMetrics, PortfolioRecommendation


def generate_recommendations(metrics: PortfolioMetrics) -> list[PortfolioRecommendation]:
    recommendations: list[PortfolioRecommendation] = []

    if metrics.concentration_share_percent and metrics.concentration_share_percent > 30:
        recommendations.append(
            PortfolioRecommendation(
                title="Trim concentration",
                rationale=(
                    "The largest position is above 30% of invested capital, "
                    "so reducing concentration improves resilience."
                ),
                priority="high",
            )
        )

    if metrics.risk_score > 70:
        recommendations.append(
            PortfolioRecommendation(
                title="Lower volatility",
                rationale=(
                    "The risk score is elevated, so shifting capital into "
                    "lower-volatility holdings is prudent."
                ),
                priority="high",
            )
        )

    if metrics.dividend_yield < 4:
        recommendations.append(
            PortfolioRecommendation(
                title="Improve income coverage",
                rationale=(
                    "The dividend yield is modest, so adding income-oriented "
                    "positions can strengthen cash flow."
                ),
                priority="medium",
            )
        )

    if metrics.leakage_percent and metrics.leakage_percent > 4:
        recommendations.append(
            PortfolioRecommendation(
                title="Reduce fee leakage",
                rationale=(
                    "Fees are absorbing a meaningful share of gains, so "
                    "lowering friction should improve net outcomes."
                ),
                priority="medium",
            )
        )

    if not recommendations:
        recommendations.append(
            PortfolioRecommendation(
                title="Maintain current posture",
                rationale=(
                    "The portfolio is balanced, so continue monitoring "
                    "concentration, income, and fee drift."
                ),
                priority="low",
            )
        )

    return recommendations
