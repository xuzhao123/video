import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

export const FONT = 'NotoSC';

const handle = delayRender('加载中文字体');
const face = new FontFace(FONT, `url(${staticFile('NotoSansSC.ttf')}) format('truetype')`, {
  weight: '100 900',
});
face
  .load()
  .then(() => {
    document.fonts.add(face);
    continueRender(handle);
  })
  .catch((err) => cancelRender(err));
