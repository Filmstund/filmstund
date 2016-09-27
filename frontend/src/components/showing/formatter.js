import moment from 'moment';

const format = (date, is3D, isVip) => {
    let formattedDate = moment(date).format("DD/M HH:mm");
    if (is3D) {
        formattedDate = "3D " + formattedDate;
    }
    if (isVip) {
        formattedDate = "VIP " + formattedDate;
    }
    return formattedDate
};

export default format;