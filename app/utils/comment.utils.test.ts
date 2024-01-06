import { filterPrivateComments } from "./comment.utils"

describe("Comment", () => {
  describe("filterPrivateComments", () => {
    const sampleFilterableComments = [{
      id: 1,
      isPrivate: true,
      submittedBy: "1",
    },
    {
      id: 2,
      isPrivate: false,
      submittedBy: "1",
    },
    {
      id: 3,
      isPrivate: true,
      submittedBy: "2",
    },
    {
      id: 4,
      isPrivate: false,
      submittedBy: "2",
    }
    ]
    test("filterPrivateComments appropriately filters out private comments owned by a different user", () => {
      expect(sampleFilterableComments.filter(c => filterPrivateComments(c, "1"))).toEqual(
        [{
          id: 1,
          isPrivate: true,
          submittedBy: "1",
        },
        {
          id: 2,
          isPrivate: false,
          submittedBy: "1",
        },
        {
          id: 4,
          isPrivate: false,
          submittedBy: "2",
        }
        ])
    })
    test("filterPrivateComments will return public comments even if no userId is provided", () => {
      expect(sampleFilterableComments.filter(c => filterPrivateComments(c, ""))).toEqual(
        [{
          id: 2,
          isPrivate: false,
          submittedBy: "1",
        },
        {
          id: 4,
          isPrivate: false,
          submittedBy: "2",
        }
        ])
    });

  })
})