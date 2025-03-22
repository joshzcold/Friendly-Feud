import { expect, test } from "@playwright/test";

test("clears session cookie on room not found error", async ({ page, context, baseURL }) => {
  // Set up an invalid session cookie
  await context.addCookies([
    {
      name: "session",
      value: "ABCD:1234",
      url: baseURL,
    },
  ]);

  // Intercept WebSocket connection and simulate a room not found error
  await page.route("**/api/ws", (route) => {
    route.fulfill({
      status: 404,
      body: JSON.stringify({
        action: "error",
        code: "errors.room_not_found",
        message: "Room not found",
      }),
    });
  });

  // Navigate to home page to trigger session revalidation
  await page.goto("/");

  // Wait for the error toast to appear
  await expect(page.getByText("Room not found")).toBeVisible({ timeout: 5000 });

  // Reload the page to
  await page.reload();
  // assert that the session cookie has been cleared
  const cookies = await context.cookies();
  const sessionCookie = cookies.find((c) => c.name === "session");
  expect(sessionCookie?.value).toBe("");
});
