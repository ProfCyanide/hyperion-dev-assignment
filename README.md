# AI Chat Full-Stack App

## Project Overview
This project is a full-stack AI chat application built with React, Remix, TypeScript, and Node.js. It allows users to interact with an LLM (OpenAI) and stores all conversations in a PostgreSQL database for future retrieval and analysis.

## Architecture & Approach
- **Frontend:** Built with React and Remix, styled with Tailwind CSS for a responsive and modern UI. The chat interface supports prompt input, displays AI responses, and shows conversation history.
- **Backend:** Node.js API routes handle prompt submission, call the OpenAI API, validate input, and process errors. All exchanges are saved to PostgreSQL using Prisma ORM.
- **Database:** PostgreSQL is used for persistent storage of all user queries and AI responses, with a unique GUID per user/browser for privacy.
- **Testing:** Unit and integration tests are written using Vitest and Testing Library to ensure reliability.
- **Deployment:** The app is deployed on Vercel, with environment variables securely managed for production.

## Assumptions & Notes
- Each user/browser is assigned a unique GUID to keep chat histories private.
- The app is designed for scalability and can be extended with authentication or additional features as needed.
- Error handling is implemented for both API and database operations.

## Future Improvements
- Add authentication for user accounts and private chat history.
- Implement rate limiting and monitoring for production.
- Expand test coverage and add E2E tests.

## Acknowledgements
Significant portions of the development process, including architecture decisions, debugging, and code implementation, were completed with the help of the Cursor AI coding assistant.

## Links
- **Deployed app link**: https://hyperion-dev-assignment.vercel.app/
- **GitHub repository link**: https://github.com/ProfCyanide/hyperion-dev-assignment

---

For development, see the original Remix and Tailwind docs for more details on running and styling the app.

# Welcome to Remix!

- 📖 [Remix docs](https://remix.run/docs)

## Development

Run the dev server:

```sh
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.

