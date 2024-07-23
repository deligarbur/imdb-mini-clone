// login
const getMoviesFromApi = ( { sort } ) => {
  console.log( 'Se están pidiendo las películas de la app' );
  return fetch( `http://localhost:4000/movies?sort=${sort}` )
    .then( response => {
      if ( !response.ok ) {
        throw new Error( 'Network response was not ok' );
      }
      return response.json();
    } )
    .then( ( data ) => {
      if ( data.success ) {
        console.log( data.data );
        return data.data;
      } else {
        console.error( 'Error al cargar las películas' );
      }
    } )
    .catch( error => {
      console.error( 'Hubo un problema con la solicitud:', error );
      return [];
    } );
};

const objToExport = {
  getMoviesFromApi: getMoviesFromApi
};

export default objToExport;
