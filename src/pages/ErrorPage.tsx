import { Link } from "react-router-dom";
export default function ErrorPage({codigo,titulo,mensaje}:{codigo:number;titulo:string;mensaje:string}){
 return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f3f5f4",padding:24}}><section style={{background:"white",borderRadius:24,padding:"3rem",maxWidth:560,textAlign:"center",boxShadow:"0 18px 50px #174ea620"}}><i className="bi bi-shield-exclamation" style={{fontSize:64,color:"#174ea6"}}/><p style={{fontSize:18,color:"#667277"}}>Error {codigo}</p><h1>{titulo}</h1><p>{mensaje}</p><Link className="btn mt-3 text-white" style={{backgroundColor:"#174ea6"}} to="/home">Volver al inicio</Link></section></main>
}
