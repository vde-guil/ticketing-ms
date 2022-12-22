import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/Header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
	return (
		<div className='container-fluid'>
			<Header currentUser={currentUser} />
			<div className='container'>
				<Component currentUser={currentUser} {...pageProps} />
			</div>
		</div>
	);
};

AppComponent.getInitialProps = async (appContext) => {
	const client = buildClient(appContext.ctx);

	try {
		const { data } = await client.get('/api/users/currentuser');
		// console.log(data)
		let pageProps = {};
		if (appContext.Component.getInitialProps) {
			pageProps = await appContext.Component.getInitialProps(
				appContext.ctx,
				client,
				data.currentUser,
			);
		}
		return { pageProps, currentUser: data.currentUser };
	} catch (err) {
		return { currentUser: null, pageProps: {} };
	}
};

export default AppComponent;
