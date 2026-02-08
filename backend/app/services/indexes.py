"""Create MongoDB indexes for SafeRound collections."""

from motor.core import AgnosticDatabase


async def create_indexes(db: AgnosticDatabase) -> None:
    """Create indexes for users and drinks. Idempotent."""
    # Sparse so documents with null/missing user_id don't break the unique index
    await db.users.create_index("user_id", unique=True, sparse=True)
    await db.drinks.create_index([("user_id", 1), ("timestamp", -1)])
    # Sparse so documents with null/missing code don't break the unique index
    await db.groups.create_index("code", unique=True, sparse=True)
