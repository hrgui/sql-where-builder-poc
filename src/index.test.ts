import { createWhereClause, processColumnExp } from "./index";

describe("createWhereClause", () => {
  it(`should process ${JSON.stringify({
    _and: [{ rating: { _gte: 4 } }, { published_on: { _gte: "2018-01-01" } }],
  })}`, () => {
    expect(
      createWhereClause({
        _and: [
          { rating: { _gte: 4 } },
          { published_on: { _gte: "2018-01-01" } },
        ],
      })
    ).toMatchInlineSnapshot(`
      Object {
        "params": Object {
          "$published_on___gte": "2018-01-01",
          "$rating___gte": 4,
        },
        "query": "rating >= $rating___gte AND published_on >= $published_on___gte",
      }
    `);
  });

  it(`should process ${JSON.stringify({
    rating: { _gte: 4 },
    published_on: { _gte: "2018-01-01" },
  })}`, () => {
    expect(
      createWhereClause({
        rating: { _gte: 4 },
        published_on: { _gte: "2018-01-01" },
      })
    ).toMatchInlineSnapshot(`
      Object {
        "params": Object {
          "$published_on___gte": "2018-01-01",
          "$rating___gte": 4,
        },
        "query": "rating >= $rating___gte AND published_on >= $published_on___gte",
      }
    `);
  });

  it(`should process ${JSON.stringify({
    _or: [
      {
        rating: { _gte: 4 },
      },
      { published_on: { _gte: "2018-01-01" } },
    ],
  })}`, () => {
    expect(
      createWhereClause({
        _or: [
          {
            rating: { _gte: 4 },
          },
          { published_on: { _gte: "2018-01-01" } },
        ],
      })
    ).toMatchInlineSnapshot(`
      Object {
        "params": Object {
          "$published_on___gte": "2018-01-01",
          "$rating___gte": 4,
        },
        "query": "rating >= $rating___gte OR published_on >= $published_on___gte",
      }
    `);
  });

  fit(`should process really complex query with ()'s`, () => {
    expect(
      createWhereClause({
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
      })
    ).toMatchInlineSnapshot(`
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
