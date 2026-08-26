"""
Shared Pydantic base config.

Every schema in this package mirrors a type in `types/portfolio.ts`. Python
fields are snake_case (PEP 8); we generate camelCase aliases automatically
so the JSON on the wire matches the existing TypeScript contracts exactly.
This is what lets DashboardView, WidgetGrid, AiAnalysisPanel, AiChatPanel,
and TransactionsTable keep working with minimal changes.
"""

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )
