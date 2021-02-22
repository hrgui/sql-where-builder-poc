import { opMap } from "./sqlOpMap";
import { BoolExp, ColumnExp } from "./types";

interface WhereOptions {
  not?: boolean;
  root?: boolean;
}

export function createWhereClause(whereExp: BoolExp, options?: WhereOptions) {
  const { not = false, root = true } = options || {};

  const boolExpMapFn = (op) => {
    return createWhereClause(op, { root: false });
  };

  const _queryFn = (queries, query) => {
    return queries.length > 1 && !root ? `( ${query} )` : query;
  };

  const processBoolExp = (boolExp, mode, expMapFn = boolExpMapFn, queryFn = _queryFn) => {
    const sqlEntries = boolExp.map(expMapFn);

    const queries = sqlEntries.map(({ query }) => query);
    const query = queries.join(` ${mode} `);

    return {
      query: queryFn(queries, query),
      params: sqlEntries
        .map(({ params }) => params)
        .reduce((pV: { [name: string]: string }, cV: { [name: string]: string }) => {
          return { ...pV, ...cV };
        }, {}),
    };
  };

  if (whereExp._and) {
    return processBoolExp(whereExp._and, "AND");
  } 
  
  if (whereExp._or) {
    return processBoolExp(whereExp._or, "OR");
  }
  
  if (whereExp._not) {
    return createWhereClause(whereExp, { not: true, root: false });
  }

  return processBoolExp(
    Object.entries(whereExp),
    "AND",
    ([columnName, columnExp]) => {
      return processColumnExp(columnName, columnExp);
    },
    (queries, query) => {
      const finalQuery = queries.length > 1 && !root ? `( ${query} )` : query;
      return not ? `NOT ( ${finalQuery} )` : finalQuery;
    }
  );
}

export function getSqlOpFromBoolExpOp(boolOp: string): string | undefined {
  return opMap[boolOp];
}


export function processColumnExp(columnName: string, columnExp: ColumnExp) {
  const sqlEntries = Object.entries(columnExp).map(([boolOp, val]) => {
    const sqlOp = getSqlOpFromBoolExpOp(boolOp);
    const paramName = `$${columnName.replace(/\./g, "__")}__${boolOp}`;
    const query = `${columnName} ${sqlOp} ${paramName}`;

    if (!sqlOp) {
      return processColumnExp(`${columnName}.${boolOp}`, val);
    }

    return {
      query,
      params: { [`${paramName}`]: val }
    }
  });

  return {
    query: sqlEntries.map(({query}) => query).join(" AND "),
    params: sqlEntries
      .map(({params}) => params)
      .reduce((pV: { [name: string]: string }, cV: { [name: string]: string }) => {
        return { ...pV, ...cV };
      }, {}),
  };
}
