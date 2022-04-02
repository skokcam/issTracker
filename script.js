class issTrackerApp {
    constructor () {        
        this.open_notify_api = 'http://api.open-notify.org/iss-now.json'; //Open Notify API url        
        this.date = new Date();         //Variable for date        
        
        this.page = {   //Build an object for page items that we will update
            message: document.getElementById('text_message'),
            timestamp: document.getElementById('text_timestamp'),
            latitude: document.getElementById('text_latitude'),
            longitude: document.getElementById('text_longitude'),
			btn: document.getElementById('start-stop')
        }       
        
        this.iss_info = { //build a open-notify.org API compatible object
            iss_position: {
                latitude: 'unknown',
                longitude: 'unknown'
            },
            message: 'waiting for connection',
            timestamp: this.date.getTime()/1000 
        }

        this.state = {
            myInterval: undefined,	//Varible for refresh callback
            refreshData: false		//Varible for data refresh    
        }

		//associate start-stop with button
		this.page.btn.addEventListener('click', this.btnClicked);
    }
    
    getISSdata = () => { //get ISS Data
        const { open_notify_api, iss_info, updatePage} = this;

        fetch(open_notify_api)
            .then(response => response.json())
            .then(data => {
                iss_info.message = data.message;
                iss_info.timestamp = data.timestamp;
                iss_info.iss_position.latitude = data.iss_position.latitude;
                iss_info.iss_position.longitude = data.iss_position.longitude;                
                //console.log(data)
            })
            .catch(err => {
                iss_info.message = err;
                iss_info.timestamp = date.getTime()/1000;
                iss_info.iss_position.latitude = 'unknown';
                iss_info.iss_position.longitude = 'unknown';                
                console.log('ISS App connection error:', err)
            })
            .finally( () => {
                updatePage()
            });
    }

	getISSdataAsync = async () => {
		const { open_notify_api, iss_info, updatePage} = this;

		try {
			let response = await fetch(open_notify_api);
			if (!response.ok) throw('Resource not available !');
			let data = await response.json();

			iss_info.message = data.message;
            iss_info.timestamp = data.timestamp;
            iss_info.iss_position.latitude = data.iss_position.latitude;
            iss_info.iss_position.longitude = data.iss_position.longitude; 
			//console.log(data);    
		}
		catch(err){
			iss_info.message = err;
            iss_info.timestamp = date.getTime()/1000;
            iss_info.iss_position.latitude = 'unknown';
            iss_info.iss_position.longitude = 'unknown';                
            console.log('ISS App connection error:', err)
		}    
		finally {
			updatePage();
		}
	}
    
    updatePage = () => { //update page data
        const { state, page, iss_info, timestamp2date } = this;

        page.message.textContent = (state.refreshData) ? iss_info.message : 'Stopped';
        page.timestamp.textContent = timestamp2date(iss_info.timestamp);
        page.latitude.textContent = iss_info.iss_position.latitude;
        page.longitude.textContent = iss_info.iss_position.longitude;
		page.btn.innerText = (state.refreshData) ? 'Stop' : 'Start';
    }
        
    timestamp2date = (unix_timestamp) => { //Conver timestamp to formatted date string
        const { date } = this;
        //https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript  
        // Create a new JavaScript Date object based on the timestamp
        // multiplied by 1000 so that the argument is in milliseconds, not seconds.
        date.setTime(unix_timestamp * 1000);

        let year = String(date.getFullYear()).padStart(4,'0');
        let month = String(date.getMonth()+1).padStart(2,'0');
        let day = String(date.getDate()).padStart(2,'0');
        let hour = String(date.getHours()).padStart(2,'0');
        let min = String(date.getMinutes()).padStart(2,'0');
        let sec = String(date.getSeconds()).padStart(2,'0');

        let formattedDate = day+'/'+month+'/'+year+' '+hour+':'+min+':'+sec;
        return formattedDate;
    }

    start = () => {
        const { state, getISSdata, updatePage } = this;

        state.refreshData = true;
        //update data every 5 seconds -> recommennded way of updating
        state.myInterval = setInterval(this.getISSdataAsync, 5000);
        updatePage();		
    }

    stop = () => {
        let { state, updatePage } = this;

        state.refreshData = false;
        clearInterval(state.myInterval);
        updatePage();		
    }

	btnClicked = () => {
		const {state, start, stop } = this;
		
		(state.refreshData) ? stop() : start();
	}
//issTrackerApp end
}

//put object to web page
tracker = new issTrackerApp;
tracker.start();
//tracker.stop();
setTimeout(tracker.stop, 10000);

