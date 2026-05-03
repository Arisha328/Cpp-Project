
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <cstring>
#include <iomanip>
#include <cmath>
#include <climits>
#include <ctime>
#include <windows.h>
#include <vector>
#include <limits>

using namespace std;

//-----------------------------------------------------------------------------------------------------
// Custom Thread Utilities (replacing std::thread and std::chrono)
//-----------------------------------------------------------------------------------------------------
class Thread {
public:
    static void sleep_for_milliseconds(int milliseconds) {
        Sleep(milliseconds); // Windows API function
    }
};

//-----------------------------------------------------------------------------------------------------
// Custom Algorithm Utilities (replacing std::algorithm)
//-----------------------------------------------------------------------------------------------------
namespace CustomAlgorithm {
    // Custom transform function
    template<typename InputIterator, typename OutputIterator, typename UnaryOperation>
    OutputIterator transform(InputIterator first, InputIterator last, OutputIterator result, UnaryOperation op) {
        while (first != last) {
            *result = op(*first);
            ++first;
            ++result;
        }
        return result;
    }

    // Custom reverse function
    template<typename BidirectionalIterator>
    void reverse(BidirectionalIterator first, BidirectionalIterator last) {
        while ((first != last) && (first != --last)) {
            swap(*first, *last);
            ++first;
        }
    }

    // Custom Pair struct (replacing std::pair)
    template<typename T1, typename T2>
    struct Pair {
        T1 first;
        T2 second;
        Pair() {}
        Pair(const T1& a, const T2& b) : first(a), second(b) {}
    };

    // Custom make_pair function
    template<typename T1, typename T2>
    Pair<T1, T2> make_pair(const T1& a, const T2& b) {
        return Pair<T1, T2>(a, b);
    }
}

//-----------------------------------------------------------------------------------------------------
// Custom Priority Queue (replacing std::priority_queue)
//-----------------------------------------------------------------------------------------------------
template<typename T, typename Compare = less<T>>
class PriorityQueue {
private:
    vector<T> heap;
    Compare comp;

    void heapifyUp(int index) {
        while (index > 0) {
            int parent = (index - 1) / 2;
            if (comp(heap[parent], heap[index])) {
                swap(heap[parent], heap[index]);
                index = parent;
            } else {
                break;
            }
        }
    }

    void heapifyDown(int index) {
        int size = heap.size();
        while (true) {
            int left = 2 * index + 1;
            int right = 2 * index + 2;
            int target = index;

            if (left < size && comp(heap[target], heap[left])) {
                target = left;
            }
            if (right < size && comp(heap[target], heap[right])) {
                target = right;
            }

            if (target != index) {
                swap(heap[index], heap[target]);
                index = target;
            } else {
                break;
            }
        }
    }

public:
    PriorityQueue() {}

    bool empty() const {
        return heap.empty();
    }

    size_t size() const {
        return heap.size();
    }

    void push(const T& value) {
        heap.push_back(value);
        heapifyUp(heap.size() - 1);
    }

    void pop() {
        if (heap.empty()) return;
        heap[0] = heap.back();
        heap.pop_back();
        if (!heap.empty()) {
            heapifyDown(0);
        }
    }

    const T& top() const {
        return heap[0];
    }
};

// Custom comparator for Pair<int, int> (for Dijkstra's algorithm)
struct PairGreater {
    bool operator()(const CustomAlgorithm::Pair<int, int>& a, const CustomAlgorithm::Pair<int, int>& b) const {
        return a.first > b.first; // For min-heap
    }
};

// --- Console Color Functions ---
void setConsoleColor(int color) {
    HANDLE hConsole = GetStdHandle(STD_OUTPUT_HANDLE);
    SetConsoleTextAttribute(hConsole, color);
}

void resetConsoleColor() {
    setConsoleColor(7); // Default white color
}

// --- Utility function to trim whitespace and convert to lowercase ---
string trimAndLowercase(string str) {
    // Remove leading and trailing whitespace
    str.erase(0, str.find_first_not_of(" \t\n\r\f\v"));
    str.erase(str.find_last_not_of(" \t\n\r\f\v") + 1);

    // Convert to lowercase
    CustomAlgorithm::transform(str.begin(), str.end(), str.begin(), ::tolower);
    return str;
}

// --- Loading Animation ---
void showLoadingAnimation(const string& message, int duration = 2) {
    cout << message;
    for (int i = 0; i < 3; i++) {
        for (const char c : "...") {
            cout << c << flush;
            Thread::sleep_for_milliseconds(300);
        }
        cout << "\b\b\b   \b\b\b";
    }
    cout << endl;
}

//-----------------------------------------------------------------------------------------------------
// --- Flight Class ---
class Flight {
public:
    string origin;
    string destination;
    string travel_date;
    string flying_time;
    string landing_time;
    int ticket_price;
    string airline_name;

    Flight() {}

    Flight(string origin, string destination, string travel_date,
           string flying_time, string landing_time, int ticket_price,
           string airline_name) {
        this->origin = origin;
        this->destination = destination;
        this->travel_date = travel_date;
        this->flying_time = flying_time;
        this->landing_time = landing_time;
        this->ticket_price = ticket_price;
        this->airline_name = airline_name;
    }

    void displayFlightDetails() const {
        setConsoleColor(11); // Cyan
        cout << "==============================================================" << endl;
        cout << "= Flight Details                                             =" << endl;
        cout << "==============================================================" << endl;
        cout << "= Origin      : " << setw(43) << left << origin << "=" << endl;
        cout << "= Destination : " << setw(43) << left << destination << "=" << endl;
        cout << "= Date        : " << setw(43) << left << travel_date << "=" << endl;
        cout << "= Departure   : " << setw(43) << left << flying_time << "=" << endl;
        cout << "= Arrival     : " << setw(43) << left << landing_time << "=" << endl;
        cout << "= Price       : $" << setw(42) << left << ticket_price << "=" << endl;
        cout << "= Airline     : " << setw(43) << left << airline_name << "=" << endl;
        cout << "==============================================================" << endl;
        resetConsoleColor();
    }

    bool isSameDay(const string& date) const {
        return travel_date == date;
    }

    int getMinutesFromTime(const string& time) const {
        int hour = 0, minute = 0;
        // Use sscanf for simple time string parsing (HH:MM)
        sscanf(time.c_str(), "%d:%d", &hour, &minute);
        return hour * 60 + minute;
    }

    int getLandingMinutes() const {
        return getMinutesFromTime(landing_time);
    }

    int getFlyingMinutes() const {
        return getMinutesFromTime(flying_time);
    }

    int getFlightDuration() const {
        // Simple duration calculation, assuming same day travel for now
        return abs(getLandingMinutes() - getFlyingMinutes());
    }

    static bool isLayoverValid(int landingMinutes, int nextFlightFlyingMinutes) {
        int layoverTime = nextFlightFlyingMinutes - landingMinutes;
        return layoverTime >= 30 && layoverTime <= 720; // 30 mins to 12 hours
    }
};

//-----------------------------------------------------------------------------------------------------
// --- Node Class for Linked List (Adjacency List & Queue) ---
class Node {
public:
    Flight flightData;
    Node* next;

    Node() : next(nullptr) {}
    Node(Flight f) : flightData(f), next(nullptr) {}
};

//-----------------------------------------------------------------------------------------------------
// --- Adjacency List Class (Linked List) ---
class AdjList {
public:
    Node* head;

    AdjList() : head(nullptr) {}

    void insert(Flight flight) {
        Node* temp = new Node(flight);
        if (!head) {
            head = temp;
        } else {
            Node* curr = head;
            while (curr->next) {
                curr = curr->next;
            }
            curr->next = temp;
        }
    }

    void print() const {
        Node* temp = head;
        while (temp) {
            temp->flightData.displayFlightDetails();
            temp = temp->next;
        }
    }

    bool isEmpty() const {
        return head == nullptr;
    }
};

//-----------------------------------------------------------------------------------------------------
// --- Hotel Class ---
class Hotel {
public:
    string city;
    int price_per_day;

    Hotel() {}
    Hotel(string city, int price_per_day) : city(city), price_per_day(price_per_day) {}

    void displayHotelDetails() const {
        setConsoleColor(14); // Yellow
        cout << "==============================================" << endl;
        cout << "= Hotel Information                          =" << endl;
        cout << "==============================================" << endl;
        cout << "= City: " << setw(35) << left << city << "=" << endl;
        cout << "= Price per Day: $" << setw(27) << left << price_per_day << "=" << endl;
        cout << "==============================================" << endl;
        resetConsoleColor();
    }
};

//-----------------------------------------------------------------------------------------------------
// --- Graph Class (Core Logic) ---
class Graph {
public:
    int maxVertices;
    AdjList* adjLists;
    Hotel* hotels;
    int hotelCount;
    string* cityNames;

    Graph(int size) : maxVertices(size), hotelCount(0) {
        adjLists = new AdjList[size];
        hotels = new Hotel[size];
        cityNames = new string[size];
    }

    ~Graph() {
        // Clean up linked lists
        for (int i = 0; i < maxVertices; ++i) {
            Node* cur = adjLists[i].head;
            while (cur) {
                Node* tmp = cur;
                cur = cur->next;
                delete tmp;
            }
        }
        delete[] adjLists;
        delete[] hotels;
        delete[] cityNames;
    }

    void addHotel(string city, int price_per_day) {
        if (hotelCount >= maxVertices) {
            setConsoleColor(12); // Red
            cout << "Error: Maximum number of cities reached." << endl;
            resetConsoleColor();
            return;
        }
        cityNames[hotelCount] = city;
        hotels[hotelCount++] = Hotel(city, price_per_day);
    }

    int findCityIndex(const string& name) const {
        string searchCity = trimAndLowercase(name);
        for (int i = 0; i < hotelCount; i++) {
            if (trimAndLowercase(cityNames[i]) == searchCity) {
                return i;
            }
        }
        return -1;
    }

    void insertFlight(int originIndex, int destinationIndex, Flight flight) {
        if (originIndex < 0 || destinationIndex < 0 ||
            originIndex >= maxVertices || destinationIndex >= maxVertices) {
            setConsoleColor(12); // Red
            cout << "Error: Invalid city indices for flight from " << flight.origin << " to " << flight.destination << endl;
            resetConsoleColor();
            return;
        }
        adjLists[originIndex].insert(flight);
    }

    void showGraph() const {
        showRoutes();
    }

    void showRoutes() const {
        setConsoleColor(10); // Green
        cout << "\n==============================================================" << endl;
        cout << "=                  Flight Network Routes                     =" << endl;
        cout << "==============================================================" << endl;
        resetConsoleColor();

        for (int i = 0; i < hotelCount; ++i) {
            cout << "\nFlights from " << cityNames[i] << ":" << endl;
            if (adjLists[i].isEmpty()) {
                cout << "(No flights available)" << endl;
            } else {
                adjLists[i].print();
            }
        }
    }

    void showHotels() const {
        setConsoleColor(14); // Yellow
        cout << "\n==============================================================" << endl;
        cout << "=                   Hotel Information                        =" << endl;
        cout << "==============================================================" << endl;
        resetConsoleColor();
        for (int i = 0; i < hotelCount; ++i) {
            hotels[i].displayHotelDetails();
        }
    }

    void showAvailableCities() const {
        setConsoleColor(13); // Purple
        cout << "\nAvailable Cities:" << endl;
        for (int i = 0; i < hotelCount; i++) {
            cout << i << ". " << cityNames[i] << endl;
        }
        resetConsoleColor();
    }

    void showLoadedCities() const { showAvailableCities(); }

    vector<Flight> searchFlightOptions(const string& start, const string& end, const string& date) {
        vector<Flight> availableFlights;
        int originIndex = findCityIndex(start);
        int destIndex = findCityIndex(end);

        if (originIndex == -1) {
            setConsoleColor(12); // Red
            cout << "\nError: Origin city '" << start << "' not found in network." << endl;
            cout << "Available cities are:" << endl;
            for (int i = 0; i < hotelCount; i++) {
                cout << "- " << cityNames[i] << endl;
            }
            resetConsoleColor();
            return availableFlights;
        }

        if (destIndex == -1) {
            setConsoleColor(12); // Red
            cout << "\nError: Destination city '" << end << "' not found in network." << endl;
            cout << "Available cities are:" << endl;
            for (int i = 0; i < hotelCount; i++) {
                cout << "- " << cityNames[i] << endl;
            }
            resetConsoleColor();
            return availableFlights;
        }

        showLoadingAnimation("Searching for flights");

        // Check direct flights first
        Node* currentFlight = adjLists[originIndex].head;
        while (currentFlight) {
            if (trimAndLowercase(currentFlight->flightData.destination) == trimAndLowercase(end) &&
                currentFlight->flightData.travel_date == date) {
                availableFlights.push_back(currentFlight->flightData);
            }
            currentFlight = currentFlight->next;
        }

        // If no direct flights found, look for connecting flights
        if (availableFlights.empty()) {
            cout << "\nNo direct flights found. Searching for connecting flights..." << endl;
            vector<CustomAlgorithm::Pair<Flight, Flight>> connectingFlights = findConnectingFlights(start, end, date);

            if (!connectingFlights.empty()) {
                setConsoleColor(14); // Yellow
                cout << "\nFound " << connectingFlights.size() << " connecting flight option(s):" << endl;
                resetConsoleColor();

                for (size_t i = 0; i < connectingFlights.size(); i++) {
                    cout << "\nConnecting Flight Option " << (i + 1) << ":" << endl;
                    cout << "First leg:" << endl;
                    connectingFlights[i].first.displayFlightDetails();
                    cout << "Second leg:" << endl;
                    connectingFlights[i].second.displayFlightDetails();

                    int layoverTime = connectingFlights[i].second.getFlyingMinutes() -
                                      connectingFlights[i].first.getLandingMinutes();
                    cout << "Layover time: " << layoverTime << " minutes" << endl;
                }

                // Return empty list to signal that only connecting flights were found and printed
                return availableFlights;
            }
        }

        return availableFlights;
    }

    void searchFlight(const string& start, const string& end, const string& date) {
        vector<Flight> flights = searchFlightOptions(start, end, date);

        if (flights.empty()) {
            setConsoleColor(14); // Yellow
            cout << "\nSearch complete. Please review the output above for any connecting flights." << endl;
            resetConsoleColor();
        } else {
            setConsoleColor(10); // Green
            cout << "\nAvailable Direct Flights found:" << endl;
            resetConsoleColor();
            for (size_t i = 0; i < flights.size(); i++) {
                cout << "\nFlight " << (i + 1) << ":" << endl;
                flights[i].displayFlightDetails();
            }
        }
    }

    bool bookFlight(const string& start, const string& end, const string& date) {
        // Collect direct flights
        vector<Flight> directFlights;
        int originIndex = findCityIndex(start);
        if (originIndex != -1) {
            Node* currentFlight = adjLists[originIndex].head;
            while (currentFlight) {
                if (trimAndLowercase(currentFlight->flightData.destination) == trimAndLowercase(end) &&
                    currentFlight->flightData.travel_date == date) {
                    directFlights.push_back(currentFlight->flightData);
                }
                currentFlight = currentFlight->next;
            }
        }

        // Collect connecting flights
        vector<CustomAlgorithm::Pair<Flight, Flight>> connectingFlights = findConnectingFlights(start, end, date);

        if (directFlights.empty() && connectingFlights.empty()) {
            setConsoleColor(12); // Red
            cout << "\nSorry, no direct or connecting flights available for the specified route and date." << endl;
            cout << "Please try a different date or route." << endl;
            resetConsoleColor();
            return false;
        }

        setConsoleColor(10); // Green
        cout << "\n============================================================" << endl;
        cout << "=                      Available Flights                     =" << endl;
        cout << "=============================================================" << endl;
        resetConsoleColor();

        // Use a vector to store a simplified representation of all bookable options
        vector<Flight> allBookableOptions;
        int optionCounter = 1;

        // Display Direct Flights
        for (const auto& flight : directFlights) {
            cout << "\nOption " << (optionCounter++) << " (Direct Flight):" << endl;
            flight.displayFlightDetails();
            allBookableOptions.push_back(flight);
        }

        // Display Connecting Flights
        for (const auto& connection : connectingFlights) {
            cout << "\nOption " << (optionCounter++) << " (Connecting Flight - Total Cost: $"
                 << (connection.first.ticket_price + connection.second.ticket_price) << "):" << endl;
            cout << "--- Leg 1: " << connection.first.origin << " to " << connection.first.destination << " ---" << endl;
            connection.first.displayFlightDetails();
            cout << "--- Leg 2: " << connection.second.origin << " to " << connection.second.destination << " ---" << endl;
            connection.second.displayFlightDetails();

            // For simplified booking confirmation, push the first flight as the marker
            allBookableOptions.push_back(connection.first);
        }

        int choice = 0;
        bool validChoice = false;

        while (!validChoice) {
            cout << "\nEnter your choice (1-" << allBookableOptions.size() << ") or 0 to cancel: ";

            if (!(cin >> choice)) {
                cin.clear();
                cin.ignore(10000, '\n');
                setConsoleColor(12); // Red
                cout << "Invalid input! Please enter a number." << endl;
                resetConsoleColor();
                continue;
            }

            // Consume the newline left by cin >> choice
            cin.ignore(numeric_limits<streamsize>::max(), '\n');

            if (choice == 0) {
                setConsoleColor(14); // Yellow
                cout << "Booking cancelled by user." << endl;
                resetConsoleColor();
                return false;
            }

            if (choice >= 1 && choice <= static_cast<int>(allBookableOptions.size())) {
                validChoice = true;
            } else {
                setConsoleColor(12); // Red
                cout << "Invalid choice! Please select a number between 1 and " << allBookableOptions.size() << "." << endl;
                resetConsoleColor();
            }
        }

        int directFlightsSize = directFlights.size();

        if (choice <= directFlightsSize) {
            // --- Direct Flight Booking Confirmation ---
            Flight selectedFlight = directFlights[choice - 1];

            setConsoleColor(10); // Green
            cout << "\n=============================================================" << endl;
            cout << "=                      Booking Confirmation                   =" << endl;
            cout << "=============================================================" << endl;
            cout << "\nYou have selected a DIRECT FLIGHT:" << endl;
            selectedFlight.displayFlightDetails();

            char confirm;
            cout << "\nConfirm booking? (y/n): ";
            cin >> confirm;
            cin.ignore(numeric_limits<streamsize>::max(), '\n'); // Clear buffer

            if (confirm == 'y' || confirm == 'Y') {
                srand(static_cast<unsigned int>(time(nullptr)));
                int bookingRef = rand() % 9000 + 1000; // Generate 4-digit number

                cout << "\nBOOKING SUCCESSFUL!" << endl;
                cout << "========================================" << endl;
                cout << "Booking Reference: FLT" << bookingRef << endl;
                cout << "Flight: " << selectedFlight.origin << " -> " << selectedFlight.destination << endl;
                cout << "Total Cost: $" << selectedFlight.ticket_price << endl;
                cout << "=========================================" << endl;
                cout << "Please save your booking reference for future use." << endl;
                resetConsoleColor();
                return true;
            } else {
                setConsoleColor(14); // Yellow
                cout << "Booking cancelled." << endl;
                resetConsoleColor();
                return false;
            }
        } else {
            // --- Connecting Flight Booking Confirmation ---
            int connIndex = choice - directFlightsSize - 1;
            const auto& selectedConnection = connectingFlights[connIndex];

            int totalCost = selectedConnection.first.ticket_price + selectedConnection.second.ticket_price;

            setConsoleColor(10); // Green
            cout << "\n=============================================================" << endl;
            cout << "=                      Booking Confirmation                   =" << endl;
            cout << "=============================================================" << endl;
            cout << "\nYou have selected a CONNECTING FLIGHT (Two Tickets):" << endl;
            cout << "Leg 1 Cost: $" << selectedConnection.first.ticket_price << endl;
            cout << "Leg 2 Cost: $" << selectedConnection.second.ticket_price << endl;
            cout << "TOTAL COST: $" << totalCost << endl;

            char confirm;
            cout << "\nConfirm booking? (y/n): ";
            cin >> confirm;
            cin.ignore(numeric_limits<streamsize>::max(), '\n'); // Clear buffer

            if (confirm == 'y' || confirm == 'Y') {
                srand(static_cast<unsigned int>(time(nullptr)));
                int bookingRef1 = rand() % 9000 + 1000;
                int bookingRef2 = rand() % 9000 + 1000;

                cout << "\nBOOKING SUCCESSFUL! (Two separate tickets required)" << endl;
                cout << "========================================" << endl;
                cout << "Total Cost: $" << totalCost << endl;
                cout << "Ticket 1 (Leg 1 - " << selectedConnection.first.origin << " to " << selectedConnection.first.destination << "): FLT" << bookingRef1 << " - $" << selectedConnection.first.ticket_price << endl;
                cout << "Ticket 2 (Leg 2 - " << selectedConnection.second.origin << " to " << selectedConnection.second.destination << "): FLT" << bookingRef2 << " - $" << selectedConnection.second.ticket_price << endl;
                cout << "=========================================" << endl;
                cout << "Please save both booking references." << endl;
                resetConsoleColor();
                return true;
            } else {
                setConsoleColor(14); // Yellow
                cout << "Booking cancelled." << endl;
                resetConsoleColor();
                return false;
            }
        }
    }

    // Find cheapest path (by ticket price) using Dijkstra's algorithm
    bool findCheapestPath(const string& startCity, const string& endCity) const {
        int startIdx = findCityIndex(startCity);
        int endIdx   = findCityIndex(endCity);

        if (startIdx == -1 || endIdx == -1) {
            setConsoleColor(12);
            cout << "\nError: One or both cities not found in the network." << endl;
            resetConsoleColor();
            return false;
        }

        const int INF = INT_MAX / 2;
        vector<int> dist(hotelCount, INF);
        vector<int> parent(hotelCount, -1);

        // P = Pair<cost, index>
        typedef CustomAlgorithm::Pair<int, int> P;
        PriorityQueue<P, PairGreater> pq;

        dist[startIdx] = 0;
        pq.push(CustomAlgorithm::make_pair(0, startIdx));

        while (!pq.empty()) {
            P current = pq.top();
            pq.pop();

            int cost = current.first; // The cost (distance)
            int u = current.second;   // The index (vertex)

            if (cost > dist[u]) continue; // Stale entry check (cost must be <= dist[u])
            if (u == endIdx) break;

            Node* cur = adjLists[u].head;
            while (cur) {
                int v = findCityIndex(cur->flightData.destination);
                if (v != -1) {
                    int w = cur->flightData.ticket_price; // weight = price
                    if (dist[u] + w < dist[v]) {
                        dist[v] = dist[u] + w;
                        parent[v] = u;
                        pq.push(CustomAlgorithm::make_pair(dist[v], v));
                    }
                }
                cur = cur->next;
            }
        }

        if (dist[endIdx] == INF) {
            setConsoleColor(12);
            cout << "\nNo route found between " << startCity << " and " << endCity << "." << endl;
            resetConsoleColor();
            return false;
        }

        // Reconstruct path
        vector<int> path;
        for (int v = endIdx; v != -1; v = parent[v]) path.push_back(v);
        CustomAlgorithm::reverse(path.begin(), path.end());

        setConsoleColor(10);
        cout << "\nCheapest route (by total ticket price):" << endl;
        resetConsoleColor();
        for (size_t i = 0; i < path.size(); ++i) {
            cout << cityNames[path[i]];
            if (i + 1 < path.size()) cout << "  ->  ";
        }
        cout << "\nTotal estimated cost: $" << dist[endIdx] << endl;
        return true;
    }

private:
    vector<CustomAlgorithm::Pair<Flight, Flight>> findConnectingFlights(const string& start, const string& end, const string& date) {
        vector<CustomAlgorithm::Pair<Flight, Flight>> connections;
        int originIndex = findCityIndex(start);

        if (originIndex == -1) return connections;

        Node* firstLeg = adjLists[originIndex].head;
        while (firstLeg) {
            if (firstLeg->flightData.travel_date == date) {
                int layoverIndex = findCityIndex(firstLeg->flightData.destination);
                if (layoverIndex != -1 && trimAndLowercase(cityNames[layoverIndex]) != trimAndLowercase(end)) {
                    Node* secondLeg = adjLists[layoverIndex].head;
                    while (secondLeg) {
                        if (trimAndLowercase(secondLeg->flightData.destination) == trimAndLowercase(end) &&
                            secondLeg->flightData.travel_date == date &&
                            Flight::isLayoverValid(firstLeg->flightData.getLandingMinutes(),
                                                   secondLeg->flightData.getFlyingMinutes())) {
                            connections.push_back(CustomAlgorithm::make_pair(firstLeg->flightData, secondLeg->flightData));
                        }
                        secondLeg = secondLeg->next;
                    }
                }
            }
            firstLeg = firstLeg->next;
        }
        return connections;
    }
};

//-----------------------------------------------------------------------------------------------------
// --- Queue Class (Based on Linked List) ---
class Queue {
private:
    Node* front;
    Node* rear;
    int numItems;

public:
    Queue() : front(nullptr), rear(nullptr), numItems(0) {}

    ~Queue() {
        clear();
    }

    bool isEmpty() const {
        return numItems == 0;
    }

    void enqueue(Flight flight) {
        Node* temp = new Node(flight);
        if (isEmpty()) {
            front = rear = temp;
        } else {
            rear->next = temp;
            rear = temp;
        }
        numItems++;
    }

    void dequeue() {
        if (isEmpty()) {
            setConsoleColor(12); // Red
            cout << "Error: Queue is empty" << endl;
            resetConsoleColor();
            return;
        }
        Node* temp = front;
        front = front->next;
        delete temp;
        numItems--;
        if (front == nullptr) {
            rear = nullptr;
        }
    }

    void clear() {
        while (!isEmpty()) {
            dequeue();
        }
    }

    Node* getFront() const {
        return front;
    }

    int size() const {
        return numItems;
    }

    void displayQueue() const {
        if (isEmpty()) {
            setConsoleColor(14); // Yellow
            cout << "Queue is empty" << endl;
            resetConsoleColor();
            return;
        }

        Node* temp = front;
        while (temp) {
            temp->flightData.displayFlightDetails();
            temp = temp->next;
        }
    }
};

//-----------------------------------------------------------------------------------------------------
// --- Utility Functions ---
void displayMenu() {
    setConsoleColor(11); // Cyan
    cout << "\n=============================================================" << endl;
    cout << "=             Flight Management System Menu                 =" << endl;
    cout << "==============================================================" << endl;
    cout << "=  1. Search Flights                                        =" << endl;
    cout << "=  2. Book a Flight                                         =" << endl;
    cout << "=  3. View All Routes                                       =" << endl;
    cout << "=  4. View Hotel Information                                =" << endl;
    cout << "=  5. Find Cheapest Route                                   =" << endl;
    cout << "=  6. Play Flight Trivia                                    =" << endl;
    cout << "=  7. Currency Converter                                    =" << endl;
    cout << "=  8. View Available Cities                                 =" << endl;
    cout << "=  9. Exit                                                  =" << endl;
    cout << "==============================================================" << endl;
    resetConsoleColor();
}

void displayHeader() {
    system("cls"); // Clear screen (Windows)
    setConsoleColor(10); // Green
    cout << "\n=============================================================" << endl;
    cout << "=                                                           =" << endl;
    cout << "=              Welcome to SkyNAV Flight Manager             =" << endl;
    cout << "=                                                           =" << endl;
    cout << "==============================================================" << endl;
    resetConsoleColor();
}

void playFlightTrivia() {
    vector<CustomAlgorithm::Pair<string, vector<string>>> questions = {
        CustomAlgorithm::make_pair(string("Which airline is known for its 'Fly Emirates' slogan?"),
         vector<string>{"Emirates", "Qatar Airways", "Air India", "American Airlines"}),
        CustomAlgorithm::make_pair(string("Which city is known as the 'Big Apple'?"),
         vector<string>{"London", "Paris", "New York", "Tokyo"}),
        CustomAlgorithm::make_pair(string("What is the capital city of Japan?"),
         vector<string>{"Beijing", "Seoul", "Tokyo", "Bangkok"})
    };
    vector<int> answers = {0, 2, 2}; // 0-based index of correct answers
    int score = 0;

    setConsoleColor(13); // Purple
    cout << "\n============================================================" << endl;
    cout << "=                      Flight Trivia Game                  =" << endl;
    cout << "==============================================================" << endl;
    resetConsoleColor();

    for (size_t i = 0; i < questions.size(); i++) {
        cout << "\nQuestion " << (i + 1) << ": " << questions[i].first << endl;
        for (size_t j = 0; j < questions[i].second.size(); j++) {
            cout << static_cast<char>('a' + j) << ") " << questions[i].second[j] << endl;
        }

        char answer;
        cout << "\nYour answer (a/b/c/d): ";
        cin >> answer;
        cin.ignore(numeric_limits<streamsize>::max(), '\n'); // Clear buffer after char input

        int idx = tolower(answer) - 'a';
        if (idx == answers[i]) {
            setConsoleColor(10); // Green
            cout << "Correct! Well done!" << endl;
            resetConsoleColor();
            score++;
        } else {
            setConsoleColor(12); // Red
            cout << "Wrong! The correct answer was: " << questions[i].second[answers[i]] << endl;
            resetConsoleColor();
        }
    }

    setConsoleColor(14); // Yellow
    cout << "\nFinal Score: " << score << "/" << questions.size() << endl;
    if (score == static_cast<int>(questions.size())) {
        cout << "Perfect score! You're a travel expert!" << endl;
    } else if (score >= static_cast<int>(questions.size()) / 2) {
        cout << "Good job! Keep learning!" << endl;
    } else {
        cout << "Better luck next time!" << endl;
    }
    resetConsoleColor();
}

// Currency Converter utility
void currencyConverter() {
    setConsoleColor(14);
    cout << "\n=============================================================" << endl;
    cout << "=                       Currency Converter                    =" << endl;
    cout << "===============================================================" << endl;

    double usdToPkr = 278.50; // approximate rate
    double amount;
    int choice;

    cout << "1. USD to PKR" << endl;
    cout << "2. PKR to USD" << endl;
    cout << "Enter choice (1 or 2): ";

    // Check if input is valid
    if (!(cin >> choice)) {
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        cout << "Invalid input for choice!" << endl;
        resetConsoleColor();
        return;
    }

    cout << "Enter amount: ";
    if (!(cin >> amount)) {
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        cout << "Invalid input for amount!" << endl;
        resetConsoleColor();
        return;
    }

    cin.ignore(numeric_limits<streamsize>::max(), '\n'); // Clear buffer after number input

    cout << fixed << setprecision(2);
    if (choice == 1) {
        cout << "$" << amount << " = PKR " << amount * usdToPkr << endl;
    } else if (choice == 2) {
        cout << "PKR " << amount << " = $" << amount / usdToPkr << endl;
    } else {
        cout << "Invalid choice!" << endl;
    }
    resetConsoleColor();
}


// --- Main Function ---
int main() {
    // 1. Setup Graph/Data
    Graph flightNetwork(10); // Max 10 cities

    // Add cities and hotel prices (Updated to include Multan)
    flightNetwork.addHotel("Karachi", 150);
    flightNetwork.addHotel("Lahore", 120);
    flightNetwork.addHotel("Islamabad", 180);
    flightNetwork.addHotel("Dubai", 250);
    flightNetwork.addHotel("London", 300);
    flightNetwork.addHotel("Istanbul", 200);
    flightNetwork.addHotel("Multan", 110); // Multan Added

    // Get indices
    int karachi = flightNetwork.findCityIndex("Karachi");
    int lahore = flightNetwork.findCityIndex("Lahore");
    int islamabad = flightNetwork.findCityIndex("Islamabad");
    int dubai = flightNetwork.findCityIndex("Dubai");
    int london = flightNetwork.findCityIndex("London");
    int istanbul = flightNetwork.findCityIndex("Istanbul");
    int multan = flightNetwork.findCityIndex("Multan"); // Get Multan index

    // Add flights (Origin, Destination, Date, Flying, Landing, Price, Airline)

    // Existing flights
    flightNetwork.insertFlight(karachi, lahore,
        Flight("Karachi", "Lahore", "2025-12-25", "10:00", "12:00", 80, "AirBlue"));
    flightNetwork.insertFlight(karachi, islamabad,
        Flight("Karachi", "Islamabad", "2025-12-25", "14:00", "16:00", 100, "PIA"));
    flightNetwork.insertFlight(lahore, karachi,
        Flight("Lahore", "Karachi", "2025-12-25", "08:00", "10:00", 85, "PIA"));
    flightNetwork.insertFlight(lahore, dubai,
        Flight("Lahore", "Dubai", "2025-12-25", "18:00", "22:00", 350, "Emirates"));
    flightNetwork.insertFlight(islamabad, london,
        Flight("Islamabad", "London", "2025-12-26", "01:00", "07:00", 600, "British Airways"));
    flightNetwork.insertFlight(dubai, istanbul,
        Flight("Dubai", "Istanbul", "2025-12-26", "11:00", "14:00", 280, "Turkish Airlines"));

    // Cheapest route test flight
    flightNetwork.insertFlight(karachi, lahore,
        Flight("Karachi", "Lahore", "2025-12-25", "16:00", "18:00", 75, "AirBlue"));

    // Connecting flight opportunity: Karachi -> Islamabad -> London
    flightNetwork.insertFlight(islamabad, london,
        Flight("Islamabad", "London", "2025-12-25", "18:30", "00:30", 550, "PIA"));

    // Connecting flight opportunity: Lahore -> Dubai -> Istanbul
    flightNetwork.insertFlight(lahore, dubai,
        Flight("Lahore", "Dubai", "2025-12-25", "10:00", "14:00", 300, "PIA")); // Leg 1
    flightNetwork.insertFlight(dubai, istanbul,
        Flight("Dubai", "Istanbul", "2025-12-25", "15:00", "18:00", 250, "Emirates")); // Leg 2 (Valid layover: 60 mins)

    // --- UPDATED FLIGHTS TO MATCH USER'S SEARCHES ---

    // Flight Lahore to Islamabad (Matches user's second search attempt date: 2025-11-01)
    flightNetwork.insertFlight(lahore, islamabad,
        Flight("Lahore", "Islamabad", "2025-11-01", "09:00", "10:30", 95, "AirSial"));

    // Flight Multan to Lahore (Matches user's second search attempt date: 2025-01-01)
    flightNetwork.insertFlight(multan, lahore,
        Flight("Multan", "Lahore", "2025-01-01", "07:00", "08:00", 50, "Shaheen Air")); // DATE CHANGED

    // 2. Main Menu Loop
    int choice;
    bool running = true;
    string start, end, date;

    while (running) {
        displayHeader();
        displayMenu();
        cout << "Enter your choice: ";

        if (!(cin >> choice)) {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            setConsoleColor(12);
            cout << "Invalid input! Please enter a number." << endl;
            resetConsoleColor();
            continue;
        }

        // Consume the rest of the line
        cin.ignore(numeric_limits<streamsize>::max(), '\n');

        switch (choice) {
            case 1: // Search Flights
                cout << "\n--- Search Flights ---" << endl;
                flightNetwork.showLoadedCities();
                cout << "Enter Origin City: ";
                getline(cin, start);
                cout << "Enter Destination City: ";
                getline(cin, end);
                cout << "Enter Date (YYYY-MM-DD): ";
                getline(cin, date);
                flightNetwork.searchFlight(start, end, date);
                break;

            case 2: // Book a Flight
                cout << "\n--- Book a Flight ---" << endl;
                flightNetwork.showLoadedCities();
                cout << "Enter Origin City: ";
                getline(cin, start);
                cout << "Enter Destination City: ";
                getline(cin, end);
                cout << "Enter Date (YYYY-MM-DD): ";
                getline(cin, date);
                flightNetwork.bookFlight(start, end, date);
                break;

            case 3: // View All Routes
                flightNetwork.showRoutes();
                break;

            case 4: // View Hotel Information
                flightNetwork.showHotels();
                break;

            case 5: // Find Cheapest Route (Dijkstra)
                cout << "\n--- Find Cheapest Route ---" << endl;
                flightNetwork.showLoadedCities();
                cout << "Enter Start City: ";
                getline(cin, start);
                cout << "Enter End City: ";
                getline(cin, end);
                flightNetwork.findCheapestPath(start, end);
                break;

            case 6: // Play Flight Trivia
                playFlightTrivia();
                break;

            case 7: // Currency Converter
                currencyConverter();
                break;

            case 8: // View Available Cities
                flightNetwork.showAvailableCities();
                break;

            case 9: // Exit
                running = false;
                setConsoleColor(10);
                cout << "\nThank you for using SkyNAV Flight Manager. Goodbye!" << endl;
                resetConsoleColor();
                break;

            default:
                setConsoleColor(12);
                cout << "\nInvalid choice. Please select an option from 1 to 9." << endl;
                resetConsoleColor();
                break;
        }

        if (running && choice != 9) {
            setConsoleColor(14);
            cout << "\nPress ENTER to continue...";
            resetConsoleColor();
            cin.get(); // Waits for user to press ENTER
        }
    }

    return 0;
}