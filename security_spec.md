# Security Specification - PingPong Pro

## Data Invariants
1. A user can only edit their own profile (except for ranking points which should ideally be system-controlled or admin-controlled).
2. A match winner can only be set if the match status is 'finished'.
3. Challenges can only be created between players of the same category.
4. Admins have full access to all collections.
5. Tournaments can only be created by admins.

## The "Dirty Dozen" Payloads
1. **Identity Spoofing**: User A trying to update User B's profile.
2. **Elevated Privileges**: User A trying to set their own role to 'admin'.
3. **Invalid Status Jump**: Match status moving from 'finished' to 'scheduled'.
4. **Out-of-Category Challenge**: Player from 'Sub 11' challenging player from '60+'.
5. **Unauthorized Score Update**: User who is not a player in the match trying to update scores.
6. **Shadow Fields**: Creating a tournament with an `isPromoted: true` field that isn't in the schema.
7. **Malformed ID**: Creating a user with a 2KB string as UID.
8. **Negative Points**: Updating ranking points to a negative value.
9. **Fake Tournament**: Non-admin creating a tournament.
10. **Duplicate Winner**: Setting a winnerId that doesn't correspond to either player1 or player2.
11. **Time Travel**: Setting a `createdAt` date in the future.
12. **PII Leak**: Non-admin user trying to list all emails in the `users` collection.

## Test Strategy
We will use Firestore rules to block these payloads.
