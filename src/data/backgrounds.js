const base='/assets/backgrounds/';
export const backgroundFrames=[
  '01-street.webp','02-approach.webp','03-profile.webp','04-confrontation.webp',
  '05-action.webp','06-closeup.webp','07-perspective.webp','08-finale.webp'
].map(file=>base+file);
export const backgroundAssignments={
  hero:7, about:1, orbit:0, contact:3, detail:6,
  categories:{poster:4,banner:0,ip:2,'short-film':3,'comic-drama':5,tvc:1,'ai-live-action':5,game:6}
};
