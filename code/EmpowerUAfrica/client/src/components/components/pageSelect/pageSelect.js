import React, {Component} from 'react';
import './pageSelect.css'; 

// No need to increment page number outside this class,
// PageSelece is responsible for the increment. (0 ... n-1) -> (1 ... n)
export default class PageSelect extends Component {
    render() {
        let page = this.props.page + 1;
        let maxPage = this.props.maxPage + 1; 
        let baseUrl = this.props.baseUrl; 
        return(
            <table className="pageselect">
                <tbody>
                    <tr>
                        <td className="pageselect-btn">
                            First Page
                        </td>
                        <td className="pageselect-btn">
                            Previous Page
                        </td>
                        <td className="pageselect-btn">
                            Next Page
                        </td>
                        <td className="pageselect-btn">
                            Last Page
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}