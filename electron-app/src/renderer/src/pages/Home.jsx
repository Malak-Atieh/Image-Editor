import SearchBar from '../components/SearchBar';
import Gallery from '../components/Gallery';

const Home = ()=>{

    return(
        
        <div className='p-4 bg-white  rounded-xl mb-4 '>
            <SearchBar />
            <Gallery />  
        </div>
    );
}
export default Home;
