export type ScrollFrame={time:number;y:number;velocity:number};
const subscribers=new Set<(frame:ScrollFrame)=>void>();
export function subscribeScrollFrame(callback:(frame:ScrollFrame)=>void){subscribers.add(callback);return()=>{subscribers.delete(callback)}}
export function emitScrollFrame(frame:ScrollFrame){subscribers.forEach(callback=>callback(frame))}
