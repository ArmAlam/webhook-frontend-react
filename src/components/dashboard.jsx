import {useState, useEffect} from "react";
import axios from "axios";

const Dashboard = () => {
	const tempData = {name: 'John', age: 26, country: "USA"};
	const [methodType, setMethodType] = useState(1);
	const [authorizationType, setAuthorizationType] = useState(1);
	const [url, setUrl] = useState('');
	const [authData, setAuthData] = useState({token: '', user_name: '', password: ''});
	const inputArr = [
		{
			key: "",
			value: "",
			id: 1
		}
	];
	const qParams = [
		{
			key: "",
			value: "",
			id: 1
		}
	];
	const bodyPayload = [
		{
			key: "",
			value: "",
		}
	];
	const [headers, setHeaders] = useState(inputArr);
	const [queryParams, setQueryParams] = useState(qParams);
	const [jsonPayload, setJsonPayload] = useState(bodyPayload);
	const [apiResponse, setApiResponse] = useState('');
	const [jsonData, setJsonData] = useState('');

	const addHeaderInput = () => {
		setHeaders(s => {
			return [
				...s,
				{
					key: "",
					value: ""
				}
			];
		});
	};

	const addQueryParamInput = () => {
		setQueryParams(s => {
			return [
				...s,
				{
					key: "",
					value: ""
				}
			];
		});
	};


	const handleHeaderChange = e => {
		e.preventDefault();

		console.log(e.target.name, e.target.value)

		const index = e.target.id;
		setHeaders(s => {
			const newArr = s.slice();
			newArr[index][e.target.name] = e.target.value;
			// newArr[index].value = e.target.value;

			return newArr;
		});
	};

	const handleQueryParamsChange = e => {
		e.preventDefault();

		const index = e.target.id;
		setQueryParams(s => {
			const newArr = s.slice();
			newArr[index][e.target.name] = e.target.value;
			// newArr[index].value = e.target.value;

			return newArr;
		});
	};


	const handleMethodTypChange = (event) => {
		setMethodType(event.target.value);
	};

	const handleAuthorizationTypeChange = (e) => {
		setAuthorizationType(e.target.value)
	}

	const handleAuthorizationDataSet = (e) => {
		const {name, value} = e.target;
		setAuthData(prevState => ({
			...prevState,
			[name]: value,
		}))
	}


	const formatDataForRequest = () => {
		const obj = {};
		const tempQueryParams = {};
		obj.request_type = methodType;
		obj.url = url;

		// query param formation
		for (let q of queryParams) {
			for (const key in q) {
				tempQueryParams[key] = q[key];
			}
		}
		obj.query_params = tempQueryParams;

		// auth data formation
		if (authorizationType === 1) {
			obj.auth_data = {
				type: 'BEARER_TOKEN',
				token: authData.token
			}
		}

		if (authorizationType === 2) {
			obj.auth_data = {
				type: 'BASIC',
				user_name: authData.user_name,
				password: authData.password
			}
		}

		return obj;
	}


	const handleApiHit = async () => {
		try {
			const response = await axios.post('http://localhost:9000/api/request/perform', formatDataForRequest());
			if (response && response.data && response.data.status) {
				setApiResponse(JSON.stringify(response.data.data))
			}
			console.log('response', response)
		} catch (e) {
			console.log('errr', e);
		}
	}


	const mapDataToPayLoad = (key, value) => {

		// setQueryParams(s => {
		// 	return [
		// 		...s,
		// 		{
		// 			key: key,
		// 			value: value
		// 		}
		// 	];
		// });

		setJsonData(prevState => {
			if (prevState === '') {
				return prevState + `"${key}" : "${value}"`
			}

			return prevState + `,\n"${key}" : "${value}"`
		})
	}


	return (
		<div>
			<div>
				<label>
					Select method type
					<select value={methodType} onChange={handleMethodTypChange}>
						<option value={1}>GET</option>
						<option value={2}>POST</option>
						<option value={3}>PUT</option>
					</select>
				</label>
			</div>
			<br/>
			<div>
				<label>URL</label>
				<input
					onChange={e => setUrl(e.target.value)}
					name="url"
					value={url}
					type="text"
				/>
			</div>
			<br/>
			<div>
				<div>
					<label>
						Select Auth type
						<select value={authorizationType} onChange={handleAuthorizationTypeChange}>
							<option value={1}>Basic</option>
							<option value={2}>Bearer</option>
						</select>
					</label>
				</div>
				<br/>
				<div>
					<label>Bearer</label>
					<input type="text" name="token" value={authData.token} onChange={handleAuthorizationDataSet}/>
				</div>
				<br/>
				<div>
					<div>
						<label>Basic</label>
						<div>
							<label>UserName</label>
							<input type="text" name="user_name" value={authData.user_name}
							       onChange={handleAuthorizationDataSet}/>
							<label>Password</label>
							<input type="password" name="password" value={authData.password}
							       onChange={handleAuthorizationDataSet}/>
						</div>
					</div>
				</div>

			</div>
			<br/>
			<div>
				<label>Headers : </label>
				<button onClick={addHeaderInput}>+</button>
				{headers.map((item, i) => {
					return (
						<>
							<input
								onChange={handleHeaderChange}
								name="key"
								value={item.key}
								id={i}
								type="text"
							/> :
							<input
								onChange={handleHeaderChange}
								name="value"
								value={item.value}
								id={i}
								type="text"
							/>
							<br/>
						</>
					);
				})}
			</div>
			<br/>
			<div>
				<label>Query Params : </label>
				<button onClick={addQueryParamInput}>+</button>
				{queryParams.map((item, i) => {
					return (
						<>
							<input
								onChange={handleQueryParamsChange}
								name="key"
								value={item.key}
								id={i}
								type="text"
							/> :
							<input
								onChange={handleQueryParamsChange}
								name="value"
								value={item.value}
								id={i}
								type="text"
							/>
							<br/>
						</>
					);
				})}
			</div>
			<br/>

			<div>
				{
					Object.entries(tempData).map(([key, value]) => (
						<>
							<div key={key}>
								{key} : {value} {"  "}
								<button onClick={() => mapDataToPayLoad(key, value)}>Map</button>
							</div>
						</>
					))
				}
			</div>

			<div>
				<textarea name="jsonData" value={jsonData} onChange={e => setJsonData(e.target.value)}/>
			</div>

			<br/>
			<div>
				<button onClick={handleApiHit}>Hit API</button>
			</div>

			<br/>
			<div>
				<label>API Response</label>
				{apiResponse}
			</div>
		</div>
	);
}

export default Dashboard;