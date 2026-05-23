export const CITIES = [
    // India
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Kolkata",
    "Goa",
    "Kochi",
    "Jaipur",
    "Ahmedabad",
    // China
    "Beijing",
    "Shanghai",
    "Guangzhou",
    "Shenzhen",
    "Chengdu",
    "Hong Kong",
    "Xi'an",
    "Hangzhou",
    // Malaysia
    "Kuala Lumpur",
    "Penang",
    "Langkawi",
    "Kota Kinabalu",
    "Johor Bahru",
    "Kuching",
    // Other hubs
    "Singapore",
    "Bangkok",
    "Dubai",
    "Tokyo",
];

export const getRegion = (city) => {
    const india = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Goa", "Kochi", "Jaipur", "Ahmedabad"];
    const china = ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hong Kong", "Xi'an", "Hangzhou"];
    const malaysia = ["Kuala Lumpur", "Penang", "Langkawi", "Kota Kinabalu", "Johor Bahru", "Kuching"];
    if (india.includes(city)) return "India";
    if (china.includes(city)) return "China";
    if (malaysia.includes(city)) return "Malaysia";
    return null;
};
