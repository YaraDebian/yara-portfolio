import 'dotenv/config';
import { Client } from '@notionhq/client';

const { NOTION_TOKEN, NOTION_DATABASE_ID, WINDOW_MINUTES = '65' } = process.env;
const notion = new Client({ auth: NOTION_TOKEN });
const since = new Date(Date.now() - Number(WINDOW_MINUTES) * 60_000).toISOString();

// Any edit counts, not just Published ones: moving an article back to Draft must also trigger a rebuild to remove it.
const res = await notion.databases.query({
  database_id: NOTION_DATABASE_ID,
  filter: { timestamp: 'last_edited_time', last_edited_time: { on_or_after: since } },
  page_size: 1,
});

console.log(res.results.length ? 'changed' : 'unchanged');
