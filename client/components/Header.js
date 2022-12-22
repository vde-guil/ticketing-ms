import Link from 'next/link';

const Header = ({ currentUser }) => {
	const links = [
		!currentUser && { label: 'Sign Up', href: '/auth/signup' },
		!currentUser && { label: 'Sign In', href: '/auth/signin' },
		currentUser && {label: 'Sell Tickets', href: '/tickets/new'},
		currentUser && {label: 'My Orders', href: '/orders'},
		currentUser && { label: 'Sign Out', href: '/auth/signout' },
	];

	return (
		<div className='container-fluid'>
			<nav className='navbar navbar-light bg-light'>
				<Link href='/' className='m-2'>
					<span className='navbar-brand'>GitTix</span>
				</Link>
				<div className='d-flex justify-content-end'>
					<ul className='nav d-flex align-items-center'>
						{links
							.filter((link) => link)
							.map(({ label, href }) => {
								return (
									<li key={label} className='nav-item m-2'>
										<Link href={href}>{label}</Link>
									</li>
								);
							})}
					</ul>
				</div>
			</nav>
		</div>
	);
};

export default Header;
