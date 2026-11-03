// In-memory mock of the Supabase client surface this app uses (the real
// project's API key is no longer accepted). Same `supabase` export shape, so
// no component changes were needed. Data lives in module-level arrays only.

import img1 from "./components/images/img1.jpg";
import img2 from "./components/images/img2.jpg";
import img3 from "./components/images/img3.jpg";

const tables = {
  Creators: [
    {
      id: 1,
      name: "Maya Reyes",
      bio: "Synthwave producer from Phoenix. I post synth breakdowns and gear clips every Friday.",
      pfp: "https://picsum.photos/seed/creator1/400",
      youtube: "https://www.youtube.com/embed/1hK1pXm2M8U",
      instagram: "https://www.instagram.com/maya.reyes.music",
    },
    {
      id: 2,
      name: "Theo Lindqvist",
      bio: "Fingerstyle guitarist from Malmo. Mostly acoustic covers and original riffs.",
      pfp: img1,
      youtube: "",
      instagram: "SKIP",
    },
    {
      id: 3,
      name: "Priya Raghunathan",
      bio: "Classical-trained vocalist exploring fusion. Carnatic meets lo-fi beats.",
      pfp: "https://picsum.photos/seed/creator3/400",
      youtube: "https://www.youtube.com/embed/V72xK9pNQ8M",
      instagram: "https://www.instagram.com/priya.sings",
    },
    {
      id: 4,
      name: "Dario Fontana",
      bio: "Piano tutor in Bologna. I teach sight-reading and upload practice routines.",
      pfp: img2,
      youtube: "https://www.youtube.com/embed/4gS6vO0ZU6k",
      instagram: "NONE",
    },
    {
      id: 5,
      name: "Amara Diallo",
      bio: "Kora player and composer. Blending West African strings with ambient textures.",
      pfp: "https://picsum.photos/seed/creator5/400",
      youtube: "https://www.youtube.com/embed/K7fA0ZtX3Wg",
      instagram: "https://www.instagram.com/amara.kora",
    },
    {
      id: 6,
      name: "Jonah Whitfield",
      bio: "Bedroom beatmaker from Leeds. Loops, drum breaks, and cheap synth restoration.",
      pfp: img3,
      youtube: "",
      instagram: "https://www.instagram.com/jonah.beats",
    },
  ],
  Posts: [
    {
      id: 1,
      title: "Best budget mic for vocal demos?",
      content:
        "I record vocal sketches in a treated closet and have about 150 dollars to spend. What would you pick?",
      upvotes: 12,
      created_at: "2026-10-28T14:30:00.000Z",
      comments: [
        {
          content: "A used SM57 plus a cheap interface will outlast anything in that range.",
          created_at: "2026-10-28T16:02:00.000Z",
        },
        {
          content: "Secondhand is the way to go, I got mine for 70 bucks and it still sounds great.",
          created_at: "2026-10-29T09:15:00.000Z",
        },
      ],
    },
    {
      id: 2,
      title: "Synthwave mix feedback thread",
      content:
        "Dropped my third track of the year. The bass sits too far forward on laptop speakers, any tips?",
      upvotes: 9,
      created_at: "2026-10-30T08:00:00.000Z",
      comments: [
        {
          content: "High-pass it around 80 Hz and let the kick carry the low end instead.",
          created_at: "2026-10-30T11:40:00.000Z",
        },
      ],
    },
    {
      id: 3,
      title: "Weekly practice challenge: sight-reading",
      content:
        "Ten minutes of clef drills a day for a week. Post your streak below and I will share my worksheet.",
      upvotes: 21,
      created_at: "2026-10-27T18:45:00.000Z",
      comments: [
        {
          content: "Day four here, the ledger lines finally stopped scaring me.",
          created_at: "2026-10-28T07:20:00.000Z",
        },
        {
          content: "Could you share the bass clef version too?",
          created_at: "2026-10-29T19:05:00.000Z",
        },
      ],
    },
    {
      id: 4,
      title: "Field recording with a kora: setup notes",
      content:
        "Recorded outside with two small diaphragm condensers. Wind was the enemy, but the take is usable.",
      upvotes: 7,
      created_at: "2026-10-31T10:10:00.000Z",
      comments: [],
    },
    {
      id: 5,
      title: "Rescue a dead Casio for under 40 dollars",
      content:
        "Found an old keyboard at a yard sale with a dead power rail. Fixed it with a solder joint and a new adapter.",
      upvotes: 15,
      created_at: "2026-10-29T13:25:00.000Z",
      comments: [
        {
          content: "Those old boards have such a unique sound, glad you saved it.",
          created_at: "2026-10-30T15:50:00.000Z",
        },
      ],
    },
    {
      id: 6,
      title: "Fingerstyle arrangement ideas needed",
      content:
        "Working on an acoustic take of a mid-tempo pop song and the chorus bridge is not landing yet.",
      upvotes: 4,
      created_at: "2026-11-01T09:00:00.000Z",
      comments: [
        {
          content: "Try thumb-slap on the off beat, it fills the gap the drums leave in the mix.",
          created_at: "2026-11-01T12:30:00.000Z",
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