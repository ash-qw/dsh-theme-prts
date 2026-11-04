export async function selectPageOption(control,value){
 const text=await control.evaluate((el,value)=>Array.from(el.options).find(option=>option.value===value)?.textContent,value)
 await control.locator('xpath=preceding-sibling::button[1]').click()
 await control.page().getByRole('option',{name:text,exact:true}).click()
}
