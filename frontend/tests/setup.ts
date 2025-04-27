import { setupServer } from "msw/node";
import { handlers } from "../src/mocks/handlers";
import { test } from "@playwright/test";

const server = setupServer(...handlers);

test.beforeAll(() => server.listen());

test.afterEach(() => server.resetHandlers());

test.afterAll(() => server.close());
