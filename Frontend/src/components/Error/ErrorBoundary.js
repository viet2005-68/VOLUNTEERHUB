import { Component } from "react";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: error };
    }
    render() {
        if (this.state.hasError) return <h2>Lỗi tùm lum</h2>
        return this.props.children;
    }
}


{/* cách dùng <ErrorBoundary>
  <AppRouter />
</ErrorBoundary> */}
