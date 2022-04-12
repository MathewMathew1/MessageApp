const stringToColor = (string: string): string => {
    let hash = 0;
    let i;
  
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    let color = '#';
  
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.substr(-2);
    }
    /* eslint-enable no-bitwise */
  
    return color;
  }

const stringAvatar = (name: string) => {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.split(' ')[0][0]}`,
    };
  }
  

  const displayDates = (date: string): string =>{
    const currentDate: Date = new Date();
    const selectedDate: Date = new Date(date)

    const diffTime = Math.abs(currentDate.getTime() - selectedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let dateToReturn = '';

    let minutes: string = selectedDate.getMinutes()<10? `0${selectedDate.getMinutes()}`:selectedDate.getMinutes().toString()
 
    if(diffDays===0){
      dateToReturn = `Today ${selectedDate.getHours()}:${minutes}`
    }
    else if(diffDays===1){
      dateToReturn = `Yesterday ${selectedDate.getHours()}:${minutes}`
    }
    else {
      dateToReturn = `${selectedDate.getDate()}/${selectedDate.getMonth()+1}/${selectedDate.getFullYear()}`
    }
    return dateToReturn
}  

const validateNumberInInput = (event: React.KeyboardEvent<HTMLDivElement>) => {
  let theEvent = event || window.event;
  
  let key
  // Handle paste
  if (theEvent.type === 'paste') {
      key = theEvent["clipboardData"].getData('text/plain');
  } else {
  // Handle key press
      key = theEvent.keyCode || theEvent.which;
      key = String.fromCharCode(key);
  }
 
  let regex = /[0-9]|\./;
  if( !regex.test(key) ) {
    theEvent["returnValue"] = false;
    if(theEvent.preventDefault) theEvent.preventDefault();
  }
} 

const copyToClipboard =(text: string) => {
  navigator.clipboard.writeText(text)
}


export {stringAvatar, stringToColor, displayDates, validateNumberInInput, copyToClipboard}  