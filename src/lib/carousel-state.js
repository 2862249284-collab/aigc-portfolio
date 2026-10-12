export const wrapIndex=(value,count)=>count?((value%count)+count)%count:0;
export function visibleSlides(items,index){
 const offsets=items.length<2?[0]:items.length===2?[0,1]:[-1,0,1];
 return items.length?offsets.map(offset=>({item:items[wrapIndex(index+offset,items.length)],offset})):[];
}
export function uniqueWorks(items){
 const ids=new Set(),sources=new Set();
 return items.filter(item=>{const source=item.media||item.cover;if(ids.has(item.id)||(source&&sources.has(source)))return false;ids.add(item.id);if(source)sources.add(source);return true;});
}
