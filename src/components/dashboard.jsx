import {useState, useEffect} from "react";
import axios from "axios";
import {
	GET,
	POST,
	PUT,
	PATCH,
	DELETE,
	AUTH_TYPE_NONE,
	AUTH_TYPE_BASIC,
	AUTH_TYPE_BEARER
} from '../../src/constants/HttpConstant';

const Dashboard = () => {
	const tempData = {name: 'John', age: 26, country: "USA"};
	const [methodType, setMethodType] = useState(GET);
	const [authorizationType, setAuthorizationType] = useState(AUTH_TYPE_NONE);
	const [url, setUrl] = useState('');
	const [authData, setAuthData] = useState({token: '', user_name: '', password: ''});
	const inputArr = [
		{
			key: "",
			value: "",
		}
	];
	const qParams = [
		{
			key: "",
			value: "",
		}
	];
	const [headers, setHeaders] = useState(inputArr);
	const [queryParams, setQueryParams] = useState(qParams);
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
		const tempHeaders = {};
		obj.request_type = methodType;
		obj.url = url;

		// query param formation
		for (let q of queryParams) {
			for (const key in q) {
				if (q[key] === '') {
					continue;
				}
				tempQueryParams[key] = q[key];
			}
		}

		if (Object.keys(tempQueryParams).length) {
			obj.query_params = tempQueryParams;
		}

		// header formation
		for (let q of headers) {
			for (const key in q) {
				if (q[key] === '') {
					continue;
				}
				tempHeaders[key] = q[key];
			}
		}

		if (Object.keys(tempHeaders).length) {
			obj.headers = tempHeaders;
		}


		// auth data formation
		if (authorizationType === AUTH_TYPE_BEARER) {
			obj.auth_data = {
				type: AUTH_TYPE_BEARER,
				token: authData.token
			}
		}

		if (authorizationType === AUTH_TYPE_BASIC) {
			obj.auth_data = {
				type: 'BASIC',
				user_name: authData.user_name,
				password: authData.password
			}
		}

		if (jsonData !== '' && methodType !== GET) {
			obj.request_payload = JSON.parse(`{${jsonData}}`);
		}

		return obj;
	}


	const handleApiHit = async () => {

		if (!url) {
			alert('enter url');
			return
		}

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


	const saveApi = async () => {
		if (!url) {
			alert('enter url');
			return
		}

		try {
			const response = await axios.post('http://localhost:9000/api/request', formatDataForRequest());
			if (response && response.data && response.data.status) {
				setApiResponse(JSON.stringify(response.data.data))
			}
			console.log('response', response)
		} catch (e) {
			console.log('errr', e);
		}
	}


	const mapDataToPayLoad = (key, value) => {

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
					Select method type: {"   "}
					<select value={methodType} onChange={handleMethodTypChange}>
						<option value={GET}>GET</option>
						<option value={POST}>POST</option>
						<option value={PUT}>PUT</option>
						<option value={PATCH}>PATCH</option>
						<option value={DELETE}>DELETE</option>
					</select>
				</label>
			</div>
			<br/>
			<div>
				<label>URL: {"   "}</label>
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
						Select Auth type {"  "}
						<select value={authorizationType} onChange={handleAuthorizationTypeChange}>
							<option value={AUTH_TYPE_NONE}>None</option>
							<option value={AUTH_TYPE_BASIC}>Basic</option>
							<option value={AUTH_TYPE_BEARER}>Bearer</option>
						</select>
					</label>
				</div>
				<br/>

				<div>
					<label>Bearer {"   "}</label>
					<input type="text" name="token" value={authData.token} onChange={handleAuthorizationDataSet}/>
				</div>

				<br/>

				<div>
					<div>
						<label>Basic</label>
						<div style={{marginLeft: '15px'}}>
							<label>UserName {"  "}</label>
							<input type="text" name="user_name" value={authData.user_name}
							       onChange={handleAuthorizationDataSet}/>
							<br/>

							<label>Password {"   "}</label>
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
				<textarea name="jsonData" rows={10} cols={50} value={jsonData} onChange={e => setJsonData(e.target.value)}/>
			</div>

			<br/>
			<div>
				<button onClick={handleApiHit}>Hit</button>
				{'      '}
				<button onClick={saveApi}>Save</button>
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