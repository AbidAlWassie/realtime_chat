import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold">Abid Al Wassie</h2>
            <p className="text-gray-300">Full Stack Developer</p>
          </div>
          <div className="flex space-x-4">
            <Link href="https://github.com/AbidAlWassie" target="_blank">
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-gray-100 hover:bg-gray-800">
                <FaGithub className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>

            <Link href="https://www.linkedin.com/in/abidalwassie" target="_blank">
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-gray-100 hover:bg-gray-800">
                <FaLinkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-gray-100 hover:bg-gray-800">
              <FaXTwitter className="h-5 w-5" />
              <span className="sr-only">X fka Twitter</span>
            </Button>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} <Link className="font-semibold text-indigo-400" href="https://www.abidalwassie.me" target="_blank">Abid Al Wassie</Link>. All rights reserved.</p>
          <p className="mt-2">Created for some fun and coffee. ☕</p>
        </div>
      </div>
    </footer>
  )
}