import { createWhereClause, processColumnExp } from "./index";

describe("createWhereClause", () => {
  const andClause = {
    _and: [{ rating: { _gte: 4 } }, { published_on: { _gte: "2018-01-01" } }],
  };
  it(`should process ${JSON.stringify(andClause)}`, () => {
    expect(createWhereClause(andClause)).toMatchInlineSnapshot(`
      Object {
        "params": Object {
          "$published_on___gte": "2018-01-01",
          "$rating___gte": 4,
        },
        "query": "rating >= $rating___gte AND published_on >= $published_on___gte",
      }
    `);
  });

  const flattenedAndClause = {
    rating: { _gte: 4 },
    published_on: { _gte: "2018-01-01" },
  };

  it(`should process ${JSON.stringify(flattenedAndClause)}`, () => {
    expect(createWhereClause(flattenedAndClause)).toMatchInlineSnapshot(`
      Object {
        "params": Object {
          "$published_on___gte": "2018-01-01",
          "$rating___gte": 4,
        },
        "query": "rating >= $rating___gte AND published_on >= $published_on___gte",
      }
    `);
  });

  const orClause = {
    _or: [
      {
        rating: { _gte: 4 },
      },
      { published_on: { _gte: "2018-01-01" } },
    ],
  };

  it(`should process ${JSON.stringify(orClause)}`, () => {
    expect(createWhereClause(orClause)).toMatchInlineSnapshot(`
      Object {
        "params": Object {
          "$published_on___gte": "2018-01-01",
          "$rating___gte": 4,
        },
        "query": "rating >= $rating___gte OR published_on >= $published_on___gte",
      }
    `);
  });

  const complexClause = {
    _and: [
      {
        price: {
          _lt: 1500,
          _gt: 500,
        },
      },
      {
        category: {
          _in: ["Computers", "Video Games"],
        },
      },
      {
        name: {
          _ilike: "%apple%",
        },
      },
      {
        _or: [
          {
            color: {
              _eq: "red",
            },
          },
          {
            rating: { _gte: 4 },
          },
          {
            best_match: { _eq: "true" },
          },
        ],
      },
    ],
  };

  it(`should process really complex query with ()'s`, () => {
    expect(createWhereClause(complexClause)).toMatchInlineSnapshot(`
      Object {
        "params": Object {
          "$best_match___eq": "true",
          "$category___in": Array [
            "Computers",
            "Video Games",
          ],
          "$color___eq": "red",
          "$name___ilike": "%apple%",
          "$price___gt": 500,
          "$price___lt": 1500,
          "$rating___gte": 4,
        },
        "query": "price < $price___lt AND price > $price___gt AND category IN $category___in AND name ILIKE $name___ilike AND ( color = $color___eq OR rating >= $rating___gte OR best_match = $best_match___eq )",
      }
    `);
  });

  const nestedClause = {
    _and: [
      {
        tags: {
          key: { _eq: "season" },
        },
      },
    ],
  };

  it(`should process nestedClause`, () => {
    expect(createWhereClause(nestedClause)).toMatchInlineSnapshot(`
      Object {
        "params": Object {
          "$tags__key___eq": "season",
        },
        "query": "tags.key = $tags__key___eq",
      }
    `);
  });
});

describe("processColumnExp", () => {
  it('should be name LIKE "%test%"', () => {
    expect(processColumnExp("name", { _like: "%test%" }))
      .toMatchInlineSnapshot(`
      Object {
        "params": Object {
          "$name___like": "%test%",
        },
        "query": "name LIKE $name___like",
      }
    `);
  });

  it("should be price > 5 AND price < 10", () => {
    expect(processColumnExp("price", { _lt: "10", _gt: 5 }))
      .toMatchInlineSnapshot(`
      Object {
        "params": Object {
          "$price___gt": 5,
          "$price___lt": "10",
        },
        "query": "price < $price___lt AND price > $price___gt",
      }
    `);
  });
});
