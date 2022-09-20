import {useState, useEffect, Fragment} from "react";
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
	const tempData = {
		first_name: "John",
		last_name: "doe",
		email: "aoyan@orangetoolz.com",
		password: 123456,
		confirm_password: 123456
	};
	const [methodType, setMethodType] = useState(GET);
	const [authorizationType, setAuthorizationType] = useState(AUTH_TYPE_NONE);
	const [url, setUrl] = useState('');
	const [authData, setAuthData] = useState({token: '', user_name: '', password: ''});
	const [headers, setHeaders] = useState([{key: "", value: "",}]);
	const [queryParams, setQueryParams] = useState([{key: "", value: "",}]);
	const [apiResponse, setApiResponse] = useState('');
	const [jsonData, setJsonData] = useState('');
	const [requestList, setRequestList] = useState([]);
	const [requestName, setRequestName] = useState('');

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
			if (q.key && q.value) {
				tempQueryParams[q.key] = q.value;
			}
		}

		if (Object.keys(tempQueryParams).length) {
			obj.query_params = tempQueryParams;
		}

		// header formation
		for (let q of headers) {
			if (q.key && q.value) {
				tempHeaders[q.key] = q.value;
			}
		}

		if (Object.keys(tempHeaders).length) {
			obj.headers = tempHeaders;
		}


		// auth data formation
		if (Number(authorizationType) === AUTH_TYPE_BEARER) {
			obj.auth_data = {
				type: AUTH_TYPE_BEARER,
				token: authData.token
			}
		}

		if (Number(authorizationType) === AUTH_TYPE_BASIC) {
			obj.auth_data = {
				type: AUTH_TYPE_BASIC,
				user_name: authData.user_name,
				password: authData.password
			}
		}

		if (jsonData !== '' && methodType !== GET) {
			obj.request_payload = JSON.parse(`{${jsonData}}`);
		}

		obj.name = requestName;

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
				getRequestList()
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

	const getRequestList = async () => {
		const response = await axios.get('http://localhost:9000/api/request/list');
		if (response && response.data && response.data.status && response.data.data) {
			setRequestList(response.data.data);
		}
	}


	const setRequestData = (requestDetails) => {
		const {
			authorization_type,
			authorization_credentials,
			body_data,
			headers,
			name,
			params,
			request_type,
			request_url
		} = requestDetails;

		setMethodType(request_type);
		setUrl(request_url);
		setRequestName(name)

		// set body data
		if (body_data) {
			let testStr = JSON.stringify(body_data)
			const tempString = testStr.substring(1, testStr.length - 1);
			body_data && setJsonData(tempString);
		}
		if (!body_data) {
			setJsonData('');
		}


		// set headers
		if (headers) {
			const tempArr = [];
			for (const key in headers) {
				tempArr.push({key: key, value: headers[key]});
			}
			setHeaders(tempArr);
		}

		// set Params
		if (params) {
			const tempArr = [];
			for (const key in params) {
				tempArr.push({key: key, value: params[key]});
			}
			setQueryParams(tempArr);
		}

		// Authorization Type set;
		setAuthorizationType(authorization_type);

		if ((Number(authorization_type) === AUTH_TYPE_BASIC) && authorization_credentials) {
			const tempAuthData = JSON.parse(authorization_credentials);
			setAuthData(prevState => ({
				...prevState,
				user_name: tempAuthData.user_name || '',
				password: tempAuthData.password || '',
			}))
		}

		if ((Number(authorization_type) === AUTH_TYPE_BEARER) && authorization_credentials) {
			const tempAuthData = JSON.parse(authorization_credentials);
			setAuthData(prevState => ({
				...prevState,
				token: tempAuthData.token || '',
			}))
		}
	}


	const getRequestDetailsById = async (requestId) => {
		const response = await axios.get(`http://localhost:9000/api/request/${requestId}`);

		if (response.data && response.data.status) {
			setRequestData(response.data.data)
		}

	}


	useEffect(() => {
		getRequestList();
	}, []);


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

				{
					(Number(authorizationType) === AUTH_TYPE_BEARER) ?
						(<>
								<div>
									<label>Token: {"   "}</label>
									<input type="text" name="token" value={authData.token}
									       onChange={handleAuthorizationDataSet}/>
								</div>
								<br/>
							</>
						) : ""
				}

				<br/>

				{
					(Number(authorizationType) === AUTH_TYPE_BASIC) ? (
						<div>
							<div>
								<label>Basic</label>
								<div style={{marginLeft: '15px'}}>
									<label>UserName {"  "}</label>
									<input type="text" name="user_name" value={authData.user_name} autoComplete="off"
									       onChange={handleAuthorizationDataSet}/>
									<br/>

									<label>Password {"   "}</label>
									<input type="password" name="password" value={authData.password}
									       autoComplete="off"
									       onChange={handleAuthorizationDataSet}/>
								</div>
							</div>
						</div>
					) : ""
				}


			</div>
			<br/>
			<div>
				<label>Headers : </label>
				<button onClick={addHeaderInput}>+</button>
				{headers.map((item, i) => {
					return (
						<Fragment key={i.toString()}>
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
						</Fragment>
					);
				})}
			</div>
			<br/>
			<div>
				<label>Query Params : </label>
				<button onClick={addQueryParamInput}>+</button>
				{queryParams.map((item, i) => {
					return (
						<Fragment key={i.toString()}>
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
						</Fragment>
					);
				})}
			</div>
			<br/>

			<div>
				<textarea name="jsonData" rows={10} cols={50} value={jsonData}
				          onChange={e => setJsonData(e.target.value)}/>
			</div>
			<br/>
			<div>
				{
					Object.entries(tempData).map(([key, value]) => (
						<div key={key}>
							{key} : {value} {"  "}
							<button onClick={() => mapDataToPayLoad(key, value)}>Map</button>
						</div>
					))
				}
			</div>

			<br/>
			<div>
				<button onClick={handleApiHit}>Hit</button>
				{'      '}
				<br/>

				<input type="text" name="request_name" value={requestName}
				       onChange={(e) => setRequestName(e.target.value)}/>
				<button onClick={saveApi}>Save</button>
			</div>
			<br/>

			<div>
				{
					requestList.length && requestList.map((request) => (
						<div key={request.id.toString()}>
							{request.name} {"    "}
							<button onClick={() => getRequestDetailsById(request.id)}>{"   "}Map</button>
						</div>
					))
				}
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