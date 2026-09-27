export const FACILITIES = [
 ['venue','Venue'],['gate','Gates'],['parking','Parking'],['hotel','Hotels'],['stay','Stay / rooms'],
 ['restaurant','Restaurants'],['food','Food courts'],['booth','Booths'],['stall','Stalls'],['security','Security'],
 ['medical','Medical'],['water','Water'],['toilet','Toilets'],['transport','Transport'],['exit','Exits'],['help','Help desk'],['zone','Zones'],
] as const;
export const facilityLabel = (kind: string) => FACILITIES.find(f => f[0] === kind)?.[1] || kind;
