import { Grid, Button, ButtonGroup } from "@mui/material"

const ToolBar = ({isToolbarVisible, textModifiedByToolbarInfo, setTextModifiedByToolbarInfo, textAreaToModified, setMessage}: {
    isToolbarVisible: boolean,
    textModifiedByToolbarInfo: {position: number[];changeSelectionForUser: boolean;},
    setTextModifiedByToolbarInfo: React.Dispatch<React.SetStateAction<{position: number[];changeSelectionForUser: boolean;}>>,
    textAreaToModified: HTMLElement|null
    setMessage: React.Dispatch<React.SetStateAction<string>> | undefined
}): JSX.Element => {

    const formatText = (tag: String) => { 
  
        let selection = window.getSelection()
        if(selection===null) return
        let selectedText: string = selection.toString()
        if(selectedText==="")return

        if(textAreaToModified===undefined) return
        let textarea = textAreaToModified as any
        
        let start = textarea.selectionStart
        let finish = textarea.selectionEnd
        let allText = textarea.value

        let newTextForSelected: string  
        const removeTag: boolean = selectedText.startsWith(`[${tag}]`) && selectedText.endsWith(`[/${tag}]`)
        if(removeTag){
            newTextForSelected =  selectedText.slice(3)
            newTextForSelected =  newTextForSelected.slice(0, -4)
        }
        else{
            newTextForSelected = `[${tag}]` + selectedText + `[/${tag}]`; 
        }
 
        let newText = allText.substring(0, start) + newTextForSelected + allText.substring(finish, allText.length)
        setTextModifiedByToolbarInfo({position: [start,start+newTextForSelected.length], changeSelectionForUser: true})
        console.log(setMessage)
        if(setMessage) setMessage(newText)

        textarea.focus()
        textarea.setSelectionRange(start,start+newTextForSelected.length)
    } 
        
    return (
        <Grid sx={{position: "absolute",display: "flex",transform: "translateX(-50%)", zIndex: "9", 
            visibility: isToolbarVisible? "visible": "hidden"}} id="toolbar">
            <ButtonGroup variant="contained" aria-label="outlined primary button group">
                <Button onClick={() => formatText("b")}><strong>B</strong></Button>
                <Button onClick={() => formatText("i")}><em>I</em></Button>
                <Button onClick={() => formatText("s")}><span style={{textDecoration: "line-through"}}>S</span></Button>
            </ButtonGroup>
        </Grid>
        
    )
}

export default ToolBar