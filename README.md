# sql-where-builder

This takes Hasura's [BoolExp](https://hasura.io/docs/1.0/graphql/core/api-reference/graphql-api/query.html#boolexp) syntax and attempts to create a SQL WHERE clauses for it using JavaScript. See [src/index.test.ts](src/index.test.ts) for sample output.

**Not battle tested, not recommended for use in production**

## Generic operators (all column types except json, jsonb):
```
_eq	=
_neq	<>
_gt	>
_lt	<
_gte	>=
_lte	<=
_in	IN
_nin	NOT IN
```

## Text Related operators
```
_like	LIKE
_nlike	NOT LIKE
_ilike	ILIKE
_nilike	NOT ILIKE
_similar	SIMILAR TO
_nsimilar	NOT SIMILAR TO
```

## Checking for Null Values
```
_is_null (takes true/false as values)	IS NULL
```


# TODO
- [x] Support Generic, Text, Null Values
- [ ] Nesting operations support `root.child`
