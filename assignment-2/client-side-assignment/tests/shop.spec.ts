import { test, expect, Page, Locator } from "@playwright/test";

const URL = "http://localhost:5173";
const createSupplierAndProduct = async (
    page: Page,
    supplier: string,
    itemDetails = { name: "חלב", price: "3" }
): Promise<{
    supplierTable: Locator;
    SupplierRow: Locator;
}> => {
    await page.goto(URL + "/admin", { timeout: 60000 });
    await expect(page.getByRole("heading", { name: "ניהול מערכת" })).toBeVisible();
    const supplierSection = page.locator("section").filter({ hasText: "ספקים רשומים" });
    const supplierTable = supplierSection.locator("table");
    await page.getByRole("button", { name: "ספק חדש" }).click({ force: true });
    await page.getByLabel("שם הספק").fill(supplier);
    await page.getByLabel("שם הפריט").fill(itemDetails.name);
    await page.getByLabel("מחיר הפריט").fill(itemDetails.price);
    await page.getByRole("button", { name: "שמור ספק" }).click({ force: true });
    const SupplierRow = supplierTable.locator("tr", { hasText: supplier });
    await expect(SupplierRow).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: "מוצר חדש" }).click();
    await expect(page.locator("#item-name")).toBeAttached({ timeout: 15000 });
    const nameInput = page.locator("#item-name");
    await nameInput.fill("חלב");
    await page.getByLabel("קטגוריה").fill("חלבי");
    await page.getByLabel("מחיר לצרכן").fill("6");
    await page.getByLabel("מלאי נוכחי").fill("25");
    await page.getByLabel("שיוך לספק").selectOption({ label: `${supplier}` });
    const saveButton = page.getByRole("button", { name: "שמור מוצר" });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    return { supplierTable, SupplierRow };
};
test("E2E Admin", async ({ page }) => {
    test.setTimeout(60000);
    const supplier = "תנובה" + Math.floor(Math.random() * 1000) + new Date().toISOString();
    const stert = await createSupplierAndProduct(page, supplier);
    const itemSection = page.locator("section").filter({ hasText: "מוצרים במערכת" });
    const itemTable = itemSection.locator("table");
    const itemRow = itemTable.getByRole("row", { name: supplier });
    await expect(itemRow).toBeVisible({ timeout: 15000 });
    await itemRow.getByRole("button", { name: "edit item" }).click();
    const priceInput = page.getByLabel("מחיר לצרכן");
    await expect(priceInput).toBeVisible({ timeout: 15000 });
    const newPrice = "5";
    await priceInput.fill(newPrice);
    await page.getByLabel("מלאי נוכחי").fill("50");
    await page.getByLabel("שיוך לספק").selectOption({ label: `${supplier}` });
    await page.getByRole("button", { name: "שמור מוצר" }).click({ force: true });
    const successEditItem = itemTable.getByRole("row", { name: supplier });
    await expect(successEditItem).toContainText(newPrice);
    await stert.SupplierRow.getByRole("button", { name: "edit supplier" }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10000 });
    const supplierName = page.getByLabel("שם הספק");
    await expect(supplierName).toBeVisible({ timeout: 10000 });
    const supplierUpdate = "תנובה" + Math.floor(Math.random() * 1000);
    await supplierName.fill(supplierUpdate);
    await page.getByRole("button", { name: "שמור ספק" }).click();
    const updateRow = stert.supplierTable.getByRole("row", { name: supplierUpdate });
    await expect(updateRow).toContainText(supplierUpdate);
    page.once("dialog", async (dialog) => {
        await dialog.accept();
    });
    await page.waitForTimeout(500);
    await updateRow.getByRole("button", { name: "delete supplier" }).click();
    await expect(updateRow).not.toBeVisible({ timeout: 10000 });
});

test("test E2E", async ({ page }) => {
    test.setTimeout(60000);
    const supplier = "טרה" + Math.floor(Math.random() * 1000);
    await createSupplierAndProduct(page, supplier);
    await page.goto(URL);
    await expect(page).toHaveTitle(/temp-app/);
    await expect(page.locator('button[title="הוסף לעגלה"]').first()).toBeVisible({ timeout: 15000 });
    const buttons = page.locator('button[title="הוסף לעגלה"]');
    const count = await buttons.count();
    const cartLink = page.getByRole("link", { name: "עגלה" });
    for (let i = 0; i < count; i++) {
        await expect(page).toHaveURL(URL);
        const buttonCart = page.getByRole("button", { name: "הוסף לעגלה" }).nth(i);
        await buttonCart.scrollIntoViewIfNeeded();
        await expect(buttonCart).toBeVisible();
        await buttonCart.dispatchEvent("click");
        await expect(cartLink).toContainText(`${i + 1}`, { timeout: 10000 });
    }
    const cartBadge = page.getByTestId("cart-badge");
    await expect(cartBadge).toContainText(`${count}`, { timeout: 10000 });
    await cartLink.click();
    await page.waitForURL("**/cart", { timeout: 10000 });
    const checkoutBtn = page.getByRole("button", { name: "מעבר לתשלום" });
    await expect(checkoutBtn).toBeAttached({ timeout: 10000 });
    await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
    await checkoutBtn.click();
    await expect(page.getByText("ההזמנה בוצעה בהצלחה!")).toBeVisible({ timeout: 10000 });
});
