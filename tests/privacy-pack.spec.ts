import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

type Catalog = {
    categories: Array<{
        name: string;
        mainstream_apps: Array<{ id: string; name: string }>;
        private_alternatives: Array<{ id: string; name: string }>;
    }>;
};

const catalog = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data", "apps.json"), "utf8"),
) as Catalog;

async function selectMailAlternative(page: Page) {
    const privateAlternativeButton = page
        .getByRole("button")
        .filter({ hasText: "[Pick]" })
        .first();

    await privateAlternativeButton.click();
    await page.getByRole("menuitem").filter({ hasText: "Proton Mail" }).click();

    await expect(
        page.getByRole("button").filter({ hasText: "Proton Mail" }),
    ).toBeVisible();
}

test("home page links into the pack builder", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/PrivacyPack/);
    await expect(
        page.getByRole("heading", { name: "PrivacyPack" }),
    ).toBeVisible();
    await expect(
        page.getByRole("link", { name: "Create your Pack" }),
    ).toHaveAttribute("href", "/create");
});

test("create page renders the full catalog and starts with exports disabled", async ({
    page,
}) => {
    await page.goto("/create");

    await expect(
        page.getByRole("button").filter({ hasText: "[Pick]" }),
    ).toHaveCount(catalog.categories.length);
    await expect(page.getByText("Mail", { exact: true })).toBeVisible();
    await expect(
        page.getByRole("button").filter({ hasText: "Gmail" }),
    ).toBeVisible();
    await expect(page.locator("#download-navbar")).toBeDisabled();
    await expect(page.locator("#share-navbar")).toBeDisabled();
});

test("selecting a private alternative enables desktop export controls", async ({
    page,
}) => {
    await page.goto("/create");
    await selectMailAlternative(page);

    await expect(page.locator("#download-navbar")).toBeEnabled();
    await expect(page.locator("#share-navbar")).toBeEnabled();
});

test("download creates a PrivacyPack PNG", async ({ page }) => {
    await page.goto("/create");
    await selectMailAlternative(page);

    const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.locator("#download-navbar").click(),
    ]);

    expect(download.suggestedFilename()).toBe("privacypack.png");

    const downloadedPath = await download.path();

    expect(downloadedPath).toBeTruthy();
    expect(fs.statSync(downloadedPath!).size).toBeGreaterThan(1_000);
});

test("share falls back to a PNG download when browser sharing is unavailable", async ({
    page,
}) => {
    await page.addInitScript(() => {
        Object.defineProperty(navigator, "share", {
            configurable: true,
            value: undefined,
        });
        Object.defineProperty(navigator, "canShare", {
            configurable: true,
            value: undefined,
        });
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: {
                write: async () => {
                    throw new Error("Clipboard blocked in test.");
                },
            },
        });
        Object.defineProperty(window, "ClipboardItem", {
            configurable: true,
            value: undefined,
        });
    });

    await page.goto("/create");
    await selectMailAlternative(page);

    const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.locator("#share-navbar").click(),
    ]);

    expect(download.suggestedFilename()).toBe("privacypack.png");
    await expect(page.getByRole("status")).toContainText(
        "Sharing is unavailable here",
    );
});

test("mobile layout keeps export controls visible and disabled until selection", async ({
    page,
}) => {
    await page.setViewportSize({ width: 393, height: 851 });
    await page.goto("/create");

    await expect(page.locator("#share-mobile")).toBeVisible();
    await expect(page.locator("#download-mobile")).toBeVisible();
    await expect(page.locator("#share-mobile")).toBeDisabled();
    await expect(page.locator("#download-mobile")).toBeDisabled();

    await selectMailAlternative(page);

    await expect(page.locator("#share-mobile")).toBeEnabled();
    await expect(page.locator("#download-mobile")).toBeEnabled();
});
