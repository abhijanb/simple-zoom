import RtcContextProvider from './RtcContext'
import Zoom from './Zoom'

const App = () => {
  return (
    <div>
      <RtcContextProvider>
        <Zoom />
      </RtcContextProvider>
    </div>
  )
}

export default App