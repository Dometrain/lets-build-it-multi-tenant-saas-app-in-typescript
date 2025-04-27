import { Note } from "@common/types/Note";
import { ReportData } from "@common/types/ReportData";
import { TenantUser } from "@common/types/TenantUser";
import { http, HttpResponse } from "msw";

const apiUrl = `https://api.${import.meta.env.VITE_DOMAIN_NAME}`;

export const handlers = [

  http.get(`${apiUrl}/notes`, async () => {
    return HttpResponse.json<Note[]>([
      {
        id: '1',
        author: 'Bob',
        content: 'We need to do lots of stuff today, like marketing, social media and even some coding in TypeScript'
      },
      {
        id: '2',
        author: 'Nadia',
        content: 'The rain in Spain falls mostly on the plane, the rain in Britain falls everywhere all at once.'
      },
      {
        id: '3',
        author: 'Bob',
        content: 'There was the bit that you missed where I distracted him with the cuddly monkey then I said "play time\'s over" and I hit him in the head with the peace lily.'
      }

    ]
    );
  }),

  http.put(`${apiUrl}/notes/:id`, async ({ params }) => {
    const { id } = params; // Extracts the ID from the URL

    console.log(`Mocked PUT request received for note ID: ${id}`);

    return HttpResponse.json({ message: "Note updated successfully", id });
  }),


  http.get(`${apiUrl}/reports`, async () => {
    return HttpResponse.json<ReportData>({
      noteCount: 3,
      mostNotableUser: 'Bob'
    }
    );
  }),


  http.get(`${apiUrl}/users`, async () => {
    return HttpResponse.json<TenantUser[]>([
      {
        name: 'Bob',
        email: 'bob@example.com'
      },
      {
        name: 'Nadia',
        email: 'nadia@example.com'
      },
      {
        name: 'Livia',
        email: 'livia@example.com'
      },
      {
        name: 'Nick',
        email: 'nick@example.com'
      }

    ]
    );
  }),
];
