'use client';
import { useEffect, useState } from 'react';

export function YouTubePlayer({videoId,title,sourceUrl}:{videoId:string;title:string;sourceUrl:string}){
 const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
 useEffect(()=>{if(status!=='loading')return;const timeout=window.setTimeout(()=>setStatus('error'),12000);return()=>window.clearTimeout(timeout)},[status]);
 return <><div className="player-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${videoId}?controls=1&autoplay=0&rel=0`} title={title} allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen onLoad={()=>setStatus('ready')} onError={()=>setStatus('error')}/>{status==='loading'&&<div className="player-status" aria-live="polite">Video yüklənir…</div>}</div>{status==='error'&&<p className="player-fallback" role="alert">Video pleyeri yüklənmədi və ya yüklənməsi gecikir. <a href={sourceUrl} target="_blank" rel="noreferrer">Rəsmi mənbədə izlə</a></p>}</>
}
