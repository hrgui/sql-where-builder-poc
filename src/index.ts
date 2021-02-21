import { opMap } from "./sqlOpMap";
import { BoolExp, ColumnExp } from "./types";

interface WhereOptions {
  not?: boolean;
  root?: boolean;
};

export function createWhereClause(whereExp: BoolExp, options?: WhereOptions) {
  const {not = false, root = true} = options || {};

  if (whereExp._and) {
    const sqlEntries = whereExp._and.map(op => {
      return createWhereClause(op, {root: false});
    });

    const queries = sqlEntries.map((({query,}) => query));
    const query = queries.join(" AND ");

    return {
      query: queries.length > 1 && !root ? `( ${query} )` : query,
      params: sqlEntries.map((({params}) => params)).reduce((pV: {[name: string]: string}, cV: {[name: string]: string}) => {
        return {...pV, ...cV};
      }, {})
    }
  } else if (whereExp._or) {
    const sqlEntries = whereExp._or.map(op => {
      return createWhereClause(op, {root: false});
    });

    const queries = sqlEntries.map((({query,}) => query));
    const query = queries.join(" OR ");

    console.log(queries.length, root);

    return {
      query: queries.length > 1 && !root ? `( ${query} )` : query,
      params: sqlEntries.map((({params}) => params)).reduce((pV: {[name: string]: string}, cV: {[name: string]: string}) => {
        return {...pV, ...cV};
      }, {})
    }

  } else if (whereExp._not) {
    return createWhereClause(whereExp, {not: true, root: false});
  }

  const sqlEntries = Object.entries(whereExp).map(([columnName, columnExp]) => {
    return processColumnExp(columnName, columnExp);
  });

  const queries = sqlEntries.map((({query,}) => query));
  const query = queries.join(" AND ");

  const finalQuery = queries.length > 1 && !root ? `( ${query} )` : query;

  return {
    query: not ? `NOT ( ${finalQuery} )` : finalQuery,
    params: sqlEntries.map((({params}) => params)).reduce((pV: {[name: string]: string}, cV: {[name: string]: string}) => {
      return {...pV, ...cV};
    }, {})
  }
}

export function getSqlOpFromBoolExpOp(boolOp: string): string | undefined {
  return opMap[boolOp];
}
export function processColumnExp(columnName: string, columnExp: ColumnExp) {
  const sqlEntries = Object.entries(columnExp).map(([boolOp, val]) => {
    return [`${columnName} ${getSqlOpFromBoolExpOp(boolOp)} $${columnName}__${boolOp}`, {[`$${columnName}__${boolOp}`]: val}];
  });


  return {
    query: sqlEntries.map((([sql]) => sql)).join(" AND "), 
    params: sqlEntries.map((([,param]) => param)).reduce((pV: {[name: string]: string}, cV: {[name: string]: string}) => {
      return {...pV, ...cV};
    }, {})
  };
}