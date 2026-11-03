// In-memory mock of the Supabase client surface this app uses (the real
// project's API key is no longer accepted). Same `supabase` export shape, so
// no component changes were needed. Data lives in module-level arrays only.

import img1 from "./components/images/img1.jpg";
import img2 from "./components/images/img2.jpg";
import img3 from "./components/images/img3.jpg";

const tables = {
  Profiles: [
    {
      id: 1,
      name: "Elena Marsh",
      bio: "Marine biologist in Halifax. I write about cold-water diving and tide-pool surveys.",
      pfp: "https://picsum.photos/seed/profile1/400",
    },
    {
      id: 2,
      name: "Marcus Obi",
      bio: "Home baker and software tester. Weekends are for sourdough experiments.",
      pfp: img1,
    },
    {
      id: 3,
      name: "Sofia Ferreira",
      bio: "Middle-school science teacher, amateur astronomer, keeper of six houseplants.",
      pfp: "https://picsum.photos/seed/profile3/400",
    },
    {
      id: 4,
      name: "Devon Clark",
      bio: "Trail runner and weekend cartographer. Making better maps of local trails.",
      pfp: img2,
    },
    {
      id: 5,
      name: "Hana Yamada",
      bio: "Ceramics student in Kobe. Small mugs, heavy glazes, slow progress.",
      pfp: "https://picsum.photos/seed/profile5/400",
    },
    {
      id: 6,
      name: "Liam O'Donnell",
      bio: "Retired postman who fixes bicycles for the neighborhood. Ask me about gears.",
      pfp: img3,
    },
  ],
  Posts: [
    {
      id: 1,
      title: "Cold-water dive report: the breakwater wall",
      content:
        "Visibility was about four meters today; the anemones have completely reclaimed the pipe.",
      upvotes: 14,
      created_at: "2026-10-28T12:00:00.000Z",
      comments: [
        {
          content: "Did you get a count on the plumose anemones this season?",
          created_at: "2026-10-28T14:20:00.000Z",
        },
        {
          content: "The pipe was mostly bare in September, so that recovery looks fast.",
          created_at: "2026-10-29T06:45:00.000Z",
        },
      ],
    },
    {
      id: 2,
      title: "Sourdough starter week five: finally rising",
      content:
        "Changed to a fifty-fifty whole wheat mix and doubled the feedings. It doubled in six hours.",
      upvotes: 10,
      created_at: "2026-10-30T07:30:00.000Z",
      comments: [
        {
          content: "Warmer water during feeds helped mine take off too.",
          created_at: "2026-10-30T09:10:00.000Z",
        },
      ],
    },
    {
      id: 3,
      title: "Backyard astronomy night Friday",
      content:
        "Saturn and two of its moons should be visible from the school field. Bring blankets and snacks.",
      upvotes: 18,
      created_at: "2026-10-27T17:15:00.000Z",
      comments: [
        {
          content: "Is the telescope still short a tripod leg? I have a spare.",
          created_at: "2026-10-28T08:00:00.000Z",
        },
      ],
    },
    {
      id: 4,
      title: "New trail map draft for the east ridge",
      content:
        "Added the seasonal loop and fixed the washed-out section. Looking for volunteer checkers.",
      upvotes: 6,
      created_at: "2026-10-31T11:20:00.000Z",
      comments: [],
    },
    {
      id: 5,
      title: "First kiln load survived",
      content:
        "Six mugs and one bowl went through cone 6 without cracking. The glaze pools exactly where I wanted.",
      upvotes: 22,
      created_at: "2026-10-29T15:40:00.000Z",
      comments: [
        {
          content: "Post pictures when they are fully cooled, the colors will deepen.",
          created_at: "2026-10-29T18:05:00.000Z",
        },
      ],
    },
    {
      id: 6,
      title: "Bike repair morning this Saturday",
      content:
        "Free fixes in the church lot from nine to noon. Brakes, flats, and chains only, please.",
      upvotes: 8,
      created_at: "2026-11-01T08:05:00.000Z",
      comments: [
        {
          content: "I will bring my gear shifter problem, thanks for doing this.",
          created_at: "2026-11-01T10:25:00.000Z",
        },
      ],
    },
  ],
};

function from(name) {
  const rows = tables[name] || (tables[name] = []);
  const nextId = () => rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1;

  let action = "select";
  let payload = null;
  let filter = null;
  let onlyOne = false;

  const matches = (row) => String(row[filter?.col]) === String(filter?.val);

  const run = async () => {
    if (action === "select") {
      let data = filter ? rows.filter(matches) : [...rows];
      if (onlyOne) {
        return data[0]
          ? { data: data[0], error: null }
          : { data: null, error: { message: "Row not found (PGRST116 mock)" } };
      }
      return { data, error: null };
    }
    if (action === "insert") {
      // Real PostgREST fills id/created_at on the server; the mock fills them here.
      if (payload.id === undefined) payload.id = nextId();
      if (payload.created_at === undefined) payload.created_at = new Date().toISOString();
      rows.push(payload);
      return { data: null, error: null };
    }
    if (action === "update") {
      if (!filter) return { data: null, error: { message: "update requires .eq()" } };
      rows.forEach((row) => matches(row) && Object.assign(row, payload));
      return { data: null, error: null };
    }
    // delete
    if (!filter) return { data: null, error: { message: "delete requires .eq()" } };
    for (let i = rows.length - 1; i >= 0; i--) matches(rows[i]) && rows.splice(i, 1);
    return { data: null, error: null };
  };

  const builder = {
    select() {
      return builder;
    },
    eq(col, val) {
      filter = { col, val };
      return builder;
    },
    single() {
      onlyOne = true;
      return builder;
    },
    insert(values) {
      action = "insert";
      payload = values;
      return builder;
    },
    update(values) {
      action = "update";
      payload = values;
      return builder;
    },
    delete() {
      action = "delete";
      return builder;
    },
    then(onFulfilled, onRejected) {
      return run().then(onFulfilled, onRejected);
    },
  };
  return builder;
}

export const supabase = { from };