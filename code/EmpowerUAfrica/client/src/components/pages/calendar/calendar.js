import React, { Component } from 'react'
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import Utils from '../../../utils'; 
import './calendar.css'

const getImportantDatesURL = '/calendar/getImportantDates'; 

export default class calendar extends Component {

    // state = {
    //     events: [
    //         { title: 'event 1 12:50', date: '2021-07-28' },
    //         { title: 'event 2', date: '2021-07-29' },
    //         { title: 'event 3', date: '2021-07-14' }
    //     ]
    // }
    state = {
        events: null
    }

    getEvents = async () => {
        let res, body ;
        try {
            ({ res, body } = await Utils.ajax(
                getImportantDatesURL,
                {
                    method: 'GET'
                }
            )); 
        }
        catch(err) {
            console.error(err); 
            alert('Internet failure'); 
            return; 
        }
        if (!res.ok) {
            alert(body.message || body); 
            return; 
        }
        return body.dates;
    }

    componentDidMount = async () => {
        const events = await this.getEvents(); 
        this.setState({
            events
        }); 
    }

    render() {

        let {events} = this.state; 
        if (events === null) {
            return null; 
        }
        for (let i = 0; i < events.length; i++) {
            const timestamp = events[i].dateTimestamp; 
            let yymmdd = Utils.timeStampToLocalDatetime(timestamp).replace('T', ' '); 
            events[i].date = yymmdd; 
        }
        console.log(events); 
        return (
            <div className='calendar_page'>

                <div className='calendar_body'>
                    <FullCalendar
                        plugins={[ dayGridPlugin ]}
                        initialView="dayGridMonth"
                        events={{events}}
                    />
                </div>

            </div>
        )
    }
}
