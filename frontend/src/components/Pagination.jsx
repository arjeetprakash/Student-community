export default function Pagination({

 totalItems,

 itemsPerPage,

 currentPage,

 setCurrentPage

}){

 const totalPages = Math.ceil(

  totalItems / itemsPerPage

 );



 if(totalPages <= 1){

  return null;

 }



 const pages = [];



 for(let i=1;i<=totalPages;i++){

  pages.push(i);

 }



 return(

  <div

   style={{

    display:"flex",

    justifyContent:"center",

    alignItems:"center",

    gap:"8px",

    marginTop:"30px",

    flexWrap:"wrap"

   }}

  >



   <button

    className="btn secondary"

    disabled={currentPage===1}

    onClick={()=>setCurrentPage(

     currentPage-1

    )}

   >

    ←

   </button>



   {pages.map(p=>(

    <button

     key={p}

     onClick={()=>setCurrentPage(p)}

     style={{

      padding:"8px 14px",

      borderRadius:"8px",

      border:"none",

      cursor:"pointer",

      fontWeight:"600",

      transition:"0.3s",

      background:

       currentPage===p

       ? "linear-gradient(120deg,#2563eb,#4f46e5)"

       : "#e2e8f0",

      color:

       currentPage===p

       ? "white"

       : "#0f172a"

     }}

    >

     {p}

    </button>

   ))}



   <button

    className="btn secondary"

    disabled={currentPage===totalPages}

    onClick={()=>setCurrentPage(

     currentPage+1

    )}

   >

    →

   </button>



  </div>

 );

}