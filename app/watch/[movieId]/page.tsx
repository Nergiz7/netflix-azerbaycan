import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Play } from 'lucide-react';
import { movies } from '@/lib/movies';
import { YouTubePlayer } from '@/components/YouTubePlayer';

export function generateStaticParams(){return movies.filter(movie=>movie.fullFilm).map(movie=>({movieId:movie.id}));}
export default async function WatchPage({params}:{params:Promise<{movieId:string}>}){
 const {movieId}=await params;const movie=movies.find(item=>item.id===movieId&&item.fullFilm&&item.provider==='youtube');if(!movie?.fullFilm)notFound();
 const url=new URL(movie.fullFilm);const videoId=url.searchParams.get('v');if(!videoId)notFound();
 const related=movies.filter(item=>item.id!==movie.id&&item.genres.some(genre=>movie.genres.includes(genre))).slice(0,6);
 return <main className="watch-page"><div className="shell"><div className="watch-top"><Link href="/" className="btn btn-ghost" style={{padding:'10px 13px'}}><ArrowLeft size={17}/>Geri</Link><span className="brand" style={{fontSize:15}}>NETFLIX AZƏRBAYCAN</span></div><h1 className="watch-title">{movie.title}</h1><div className="watch-meta">{movie.year} · {movie.genres.join(' · ')} · Azərbaycan filmi</div><YouTubePlayer videoId={videoId} title={`${movie.title} — rəsmi tam film`} sourceUrl={movie.fullFilm}/><div className="watch-source"><a className="btn btn-red" href={movie.fullFilm} target="_blank" rel="noreferrer"><Play size={16} fill="currentColor"/>Rəsmi mənbədə izlə<ExternalLink size={15}/></a><div style={{marginTop:12}}>Video Azərbaycanfilm studiyasının rəsmi YouTube kanalından yerləşdirilib. YouTube pleyerinin rəsmi idarəetmə vasitələrindən istifadə edin.</div><div style={{marginTop:8}}>Mənbə: <a href={movie.source} target="_blank" rel="noreferrer" style={{color:'#ddd'}}>{movie.sourceLabel}</a></div></div><p className="watch-copy">{movie.description}</p><section className="section"><h2>Oxşar filmlər</h2><div className="watch-related">{related.map(item=><Link key={item.id} href={item.fullFilm?`/watch/${item.id}`:`/#film-${item.id}`}><strong>{item.title}</strong><div className="section-note">{item.year} · {item.genres[0]}</div></Link>)}</div></section><footer className="footer" style={{padding:'28px 0 0'}}>Bu sayt yalnız tədris məqsədilə hazırlanmış qeyri-rəsmi layihədir. Netflix şirkəti ilə əlaqəsi yoxdur. Filmlər yalnız hüquq sahiblərinin icazə verdiyi rəsmi mənbələr vasitəsilə təqdim olunur.</footer></div></main>
}
