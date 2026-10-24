export async function dropFile(page, selector, { name, mimeType, buffer }) {
  const transfer = await page.evaluateHandle(({ name, mimeType, bytes }) => {
    const data = new DataTransfer()
    data.items.add(new File([new Uint8Array(bytes)], name, { type: mimeType }))
    return data
  }, { name, mimeType, bytes: [...buffer] })
  try {
    await page.locator(selector).dispatchEvent('dragenter', { dataTransfer: transfer })
    await page.locator(selector).dispatchEvent('drop', { dataTransfer: transfer })
  } finally { await transfer.dispose() }
}
